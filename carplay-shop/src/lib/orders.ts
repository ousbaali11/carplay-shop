import { prisma } from "@/lib/prisma";
import { generateDownloadToken, downloadExpiryDate } from "@/lib/tokens";
import { sendOrderConfirmationEmail, sendAdminNewOrderNotification } from "@/lib/email";
import { generateInvoicePdf } from "@/lib/invoice";
import { PaymentMethod } from "@prisma/client";

// Appelée uniquement depuis un webhook Stripe vérifié, une capture PayPal
// confirmée côté serveur (référence + montant contrôlés), ou le contrôle de
// secours sur la page de confirmation (session Stripe contrôlée). Le paramètre
// "force" permet aussi à l'admin de la relancer manuellement sur une commande
// restée bloquée (paiement reçu mais confirmation jamais aboutie côté serveur).
//
// IDEMPOTENTE ET ATOMIQUE : la commande est "réservée" en base par un UPDATE
// conditionnel (statut PENDING_PAYMENT → payé) à l'intérieur d'une transaction.
// Si deux appels arrivent en même temps (webhook + page de confirmation), un
// seul passe ; l'autre récupère la commande déjà finalisée sans rien dupliquer
// (ni PDF, ni email).
export async function finalizeOrderPayment(orderId: string, method: PaymentMethod, paymentRef: string, force = false) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      vehicle: {
        include: {
          pdfs: true,
          activationType: { include: { pdfs: true } },
        },
      },
    },
  });
  if (!order) throw new Error("Commande introuvable");
  if (order.status !== "PENDING_PAYMENT" && !force) {
    return order; // déjà traité (idempotence)
  }
  if (order.status === "CANCELED" || order.status === "REFUNDED") {
    // Même en mode "force", on ne relivre jamais une commande annulée/remboursée.
    throw new Error("Cette commande est annulée ou remboursée, impossible de la finaliser.");
  }

  if (!order.vehicle) {
    // Le véhicule a été supprimé entre la commande et le paiement : on finalise
    // quand même (le client a payé), sans PDF ; l'admin est notifié et pourra
    // livrer manuellement. On ne bloque surtout pas le webhook (sinon Stripe
    // réessaie indéfiniment).
    console.warn(`Commande ${order.orderNumber} : véhicule supprimé, finalisation sans PDF.`);
  }

  const token = generateDownloadToken();
  const isPhysical = order.formula === "PHYSICAL_CARD";

  const pdfsToCreate = order.vehicle
    ? [
        // PDF propres à la formule achetée.
        ...order.vehicle.pdfs
          .filter((p) => p.formula === order.formula)
          .map((p) => ({ orderId: order.id, data: p.data, fileName: p.fileName, title: p.title, position: p.position })),
        // Guide(s) du type d'activation sélectionné (commun aux deux formules).
        ...(order.vehicle.activationType?.pdfs.map((p) => ({
          orderId: order.id,
          data: p.data,
          fileName: p.fileName,
          title: order.vehicle!.activationType!.name,
          position: 1000 + p.position,
        })) || []),
      ]
    : [];

  const updated = await prisma.$transaction(async (tx) => {
    // Réservation atomique : ne touche la ligne que si elle est encore dans
    // l'état attendu. En mode normal : encore en attente de paiement. En mode
    // force : pas encore de lien de téléchargement.
    const claimed = await tx.order.updateMany({
      where: force ? { id: orderId, downloadToken: null } : { id: orderId, status: "PENDING_PAYMENT" },
      data: {
        status: isPhysical ? "PREPARING" : "PAID",
        paymentMethod: method,
        paymentRef,
        downloadToken: token,
        downloadExpiresAt: downloadExpiryDate(),
      },
    });
    if (claimed.count === 0) return null;

    if (pdfsToCreate.length > 0) {
      await tx.orderPdf.createMany({ data: pdfsToCreate });
    }
    return tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { pdfs: true } });
  });

  if (!updated) {
    // Quelqu'un d'autre a finalisé entre-temps : on renvoie l'état actuel.
    return prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { pdfs: true } });
  }

  // À partir d'ici la commande est payée en base : une erreur d'email ou de
  // facture ne doit pas faire croire à l'appelant que le paiement a échoué.
  try {
    const siteSettings = await getSiteSettings();
    const invoicePdf = siteSettings.invoicesEnabled
      ? await generateInvoicePdf({
          orderNumber: updated.orderNumber,
          createdAt: updated.createdAt,
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          address: updated.address,
          addressComp: updated.addressComp,
          postalCode: updated.postalCode,
          city: updated.city,
          country: updated.country,
          vehicleTitle: updated.vehicleTitle,
          vehicleYear: updated.vehicleYear,
          formula: updated.formula,
          priceCents: updated.priceCents,
          paymentMethod: updated.paymentMethod,
        })
      : null;

    await sendOrderConfirmationEmail({
      email: updated.email,
      firstName: updated.firstName,
      orderNumber: updated.orderNumber,
      vehicleLabel: `${updated.vehicleTitle} (année ${updated.vehicleYear})`,
      priceCents: updated.priceCents,
      downloadToken: token,
      isPhysical,
      invoicePdf,
      whatsappUrl: siteSettings.whatsappUrl,
      // Formule "fichiers seuls" : les liens Google Drive ne sont pas encore
      // insérés par l'admin au moment du paiement — le bouton d'accès n'apparaît
      // pas dans ce premier email, un second email suivra une fois prêt.
      filesReady: isPhysical,
    });

    await sendAdminNewOrderNotification({
      orderNumber: updated.orderNumber,
      vehicleLabel: `${updated.vehicleTitle} (année ${updated.vehicleYear})`,
      isPhysical,
    });
  } catch (err) {
    console.error(`Commande ${updated.orderNumber} finalisée mais email/facture en échec :`, err);
  }

  return updated;
}

export async function getPaymentSettings() {
  return prisma.paymentSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
}

export async function getSiteSettings() {
  return prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
}
