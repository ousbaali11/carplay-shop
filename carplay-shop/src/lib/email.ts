import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "commandes@tondomaine.fr";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function eur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

// Email envoyé automatiquement dès que le paiement est confirmé.
// Contient : le récap commande (facture) + le lien sécurisé vers le téléchargement.
export async function sendOrderConfirmationEmail(order: {
  email: string;
  firstName: string;
  orderNumber: string;
  vehicleLabel: string;
  priceCents: number;
  downloadToken: string;
  isPhysical: boolean;
  invoicePdf: Buffer;
}) {
  const downloadUrl = `${SITE_URL}/telechargement/${order.downloadToken}`;

  const physicalNote = order.isPhysical
    ? `<p>Votre carte mémoire va être préparée puis expédiée par courrier. Vous recevrez un email avec le numéro de suivi dès son envoi. Le guide PDF est disponible dès maintenant.</p>`
    : `<p>Vos fichiers d'activation et votre guide PDF sont disponibles dès maintenant au lien ci-dessous.</p>`;

  await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `Confirmation de commande ${order.orderNumber} — ${order.vehicleLabel}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: auto;">
        <h2>Merci pour votre commande, ${order.firstName} !</h2>
        <p>Votre paiement a bien été confirmé. Votre facture est jointe à cet email.</p>
        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding:6px 0; color:#666;">N° de commande</td><td style="text-align:right;">${order.orderNumber}</td></tr>
          <tr><td style="padding:6px 0; color:#666;">Véhicule</td><td style="text-align:right;">${order.vehicleLabel}</td></tr>
          <tr><td style="padding:6px 0; color:#666;">Montant payé</td><td style="text-align:right;"><b>${eur(order.priceCents)}</b></td></tr>
        </table>
        ${physicalNote}
        <p style="margin-top:24px;">
          <a href="${downloadUrl}" style="background:#111; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; display:inline-block;">
            Accéder à mes fichiers
          </a>
        </p>
        <p style="font-size:12px; color:#999;">Ce lien est personnel et valable 30 jours. Ne le partagez pas.</p>
      </div>
    `,
    attachments: [
      {
        filename: `facture-${order.orderNumber}.pdf`,
        content: order.invoicePdf,
      },
    ],
  });
}

// Email envoyé par l'admin (manuellement depuis le tableau de bord) quand la carte physique part à La Poste.
export async function sendShippingNotificationEmail(order: {
  email: string;
  firstName: string;
  orderNumber: string;
  trackingNumber?: string | null;
}) {
  await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `Votre carte mémoire a été expédiée — ${order.orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: auto;">
        <h2>Votre carte mémoire est en route, ${order.firstName} !</h2>
        <p>Commande ${order.orderNumber} expédiée.</p>
        ${
          order.trackingNumber
            ? `<p>Numéro de suivi : <b>${order.trackingNumber}</b></p>`
            : "<p>Vous recevrez votre colis sous quelques jours.</p>"
        }
      </div>
    `,
  });
}

// Notification interne à l'admin pour chaque nouvelle commande payée (préparation à faire si carte physique).
export async function sendAdminNewOrderNotification(order: {
  orderNumber: string;
  vehicleLabel: string;
  isPhysical: boolean;
}) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return;
  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `Nouvelle commande ${order.orderNumber}${order.isPhysical ? " — carte à préparer" : ""}`,
    html: `<p>Nouvelle commande payée : ${order.orderNumber} (${order.vehicleLabel}).</p>
      ${order.isPhysical ? "<p><b>Action requise :</b> préparer et expédier la carte mémoire depuis le tableau de bord admin.</p>" : ""}`,
  });
}
