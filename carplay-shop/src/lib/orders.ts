import { prisma } from "@/lib/prisma";
import { generateDownloadToken, downloadExpiryDate } from "@/lib/tokens";
import { sendOrderConfirmationEmail, sendAdminNewOrderNotification } from "@/lib/email";
import { generateInvoicePdf } from "@/lib/invoice";
import { PaymentMethod } from "@prisma/client";

// Appelée uniquement depuis un webhook Stripe vérifié, une capture PayPal confirmée
// côté serveur, ou le contrôle de secours sur la page de confirmation.
export async function finalizeOrderPayment(orderId: string, method: PaymentMethod, paymentRef: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { vehicle: { include: { pdfs: true, activationFiles: true } } },
  });
  if (!order) throw new Error("Commande introuvable");
  if (order.status !== "PENDING_PAYMENT") {
    return order; // déjà traité (idempotence)
  }
  if (!order.vehicle) {
    throw new Error("Le véhicule associé à cette commande n'existe plus, impossible de livrer le fichier.");
  }

  const token = generateDownloadToken();
  const isPhysical = order.formula === "PHYSICAL_CARD";

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: isPhysical ? "PREPARING" : "PAID",
      paymentMethod: method,
      paymentRef,
      downloadToken: token,
      downloadExpiresAt: downloadExpiryDate(),
      // PDF et fichiers d'activation de la formule choisie uniquement.
      pdfs: {
        create: order.vehicle.pdfs
          .filter((p) => p.formula === order.formula)
          .map((p) => ({ data: p.data, fileName: p.fileName, title: p.title, position: p.position })),
      },
      // Les fichiers d'activation ne sont livrés au client QUE pour la formule
      // "fichiers seuls" ; pour la carte physique, l'admin utilise les fichiers
      // "live" de la fiche véhicule (jamais transmis directement au client).
      activationFiles: isPhysical
        ? undefined
        : {
            create: order.vehicle.activationFiles
              .filter((f) => f.formula === "FILES_ONLY")
              .map((f) => ({ data: f.data, fileName: f.fileName, position: f.position })),
          },
    },
    include: { pdfs: true },
  });

  const invoicePdf = await generateInvoicePdf({
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
    vehicleBrand: updated.vehicleBrand,
    vehicleModel: updated.vehicleModel,
    vehicleYear: updated.vehicleYear,
    formula: updated.formula,
    priceCents: updated.priceCents,
    paymentMethod: updated.paymentMethod,
  });

  await sendOrderConfirmationEmail({
    email: updated.email,
    firstName: updated.firstName,
    orderNumber: updated.orderNumber,
    vehicleLabel: `${updated.vehicleBrand} ${updated.vehicleModel} (${updated.vehicleYear})`,
    priceCents: updated.priceCents,
    downloadToken: token,
    isPhysical,
    invoicePdf,
  });

  await sendAdminNewOrderNotification({
    orderNumber: updated.orderNumber,
    vehicleLabel: `${updated.vehicleBrand} ${updated.vehicleModel} (${updated.vehicleYear})`,
    isPhysical,
  });

  return updated;
}

export async function getSettings() {
  return prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
}
