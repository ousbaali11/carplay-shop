import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function eur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

// Construit le client Resend + les infos d'expéditeur à partir de la base
// (réglables depuis /admin/integrations). Renvoie null si aucune clé n'est configurée.
async function getEmailConfig() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!settings?.resendApiKey) return null;
  return {
    resend: new Resend(settings.resendApiKey),
    from: settings.emailFrom || "commandes@tondomaine.fr",
    adminEmail: settings.adminNotificationEmail,
  };
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
  invoicePdf: Buffer | null;
  whatsappUrl: string | null;
  filesReady: boolean;
}) {
  const config = await getEmailConfig();
  if (!config) {
    console.error("Email non envoyé : Resend n'est pas configuré (voir /admin/integrations).");
    return;
  }

  const downloadUrl = `${SITE_URL}/telechargement/${order.downloadToken}`;

  const physicalNote = order.isPhysical
    ? `<p>Votre carte mémoire va être préparée puis expédiée par Mondial Relais. Vous recevrez un email avec le numéro de suivi dès son envoi. Le guide PDF est disponible dès maintenant.</p>`
    : order.filesReady
    ? `<p>Vos fichiers d'activation et votre guide PDF sont disponibles dès maintenant au lien ci-dessous.</p>`
    : `<p>Vos fichiers d'activation sont en cours de préparation. Vous recevrez un second email dès qu'ils seront disponibles au téléchargement.</p>`;

  const whatsappNote = order.whatsappUrl
    ? `<p style="margin-top:16px;">Une question sur votre commande ? Contactez-nous directement sur <a href="${order.whatsappUrl}">WhatsApp</a>.</p>`
    : "";

  const accessButton = order.filesReady
    ? `<p style="margin-top:24px;">
         <a href="${downloadUrl}" style="background:#111; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; display:inline-block;">
           Accéder à mes fichiers
         </a>
       </p>
       <p style="font-size:12px; color:#999;">Ce lien est personnel et valable 30 jours. Ne le partagez pas.</p>`
    : "";

  await config.resend.emails.send({
    from: config.from,
    to: order.email,
    subject: `Confirmation de commande ${order.orderNumber} — ${order.vehicleLabel}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: auto;">
        <h2>Merci pour votre commande, ${order.firstName} !</h2>
        <p>Votre paiement a bien été confirmé.${order.invoicePdf ? " Votre facture est jointe à cet email." : ""}</p>
        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding:6px 0; color:#666;">N° de commande</td><td style="text-align:right;">${order.orderNumber}</td></tr>
          <tr><td style="padding:6px 0; color:#666;">Véhicule</td><td style="text-align:right;">${order.vehicleLabel}</td></tr>
          <tr><td style="padding:6px 0; color:#666;">Montant payé</td><td style="text-align:right;"><b>${eur(order.priceCents)}</b></td></tr>
        </table>
        ${physicalNote}
        ${accessButton}
        ${whatsappNote}
      </div>
    `,
    attachments: order.invoicePdf
      ? [
          {
            filename: `facture-${order.orderNumber}.pdf`,
            content: order.invoicePdf,
          },
        ]
      : undefined,
  });
}

// Formule "fichiers seuls" uniquement : envoyé quand l'admin a inséré les liens
// Google Drive de la commande et clique sur "Enregistrer et envoyer au client".
export async function sendFilesReadyEmail(order: {
  email: string;
  firstName: string;
  orderNumber: string;
  vehicleLabel: string;
  downloadToken: string;
  whatsappUrl: string | null;
}) {
  const config = await getEmailConfig();
  if (!config) {
    console.error("Email non envoyé : Resend n'est pas configuré (voir /admin/integrations).");
    return;
  }

  const downloadUrl = `${SITE_URL}/telechargement/${order.downloadToken}`;
  const whatsappNote = order.whatsappUrl
    ? `<p style="margin-top:16px;">Une question ? Contactez-nous directement sur <a href="${order.whatsappUrl}">WhatsApp</a>.</p>`
    : "";

  await config.resend.emails.send({
    from: config.from,
    to: order.email,
    subject: `Vos fichiers sont prêts — ${order.orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: auto;">
        <h2>Bonne nouvelle, ${order.firstName} !</h2>
        <p>Les fichiers d'activation de votre commande ${order.orderNumber} (${order.vehicleLabel}) sont maintenant disponibles.</p>
        <p style="margin-top:24px;">
          <a href="${downloadUrl}" style="background:#111; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; display:inline-block;">
            Accéder à mes fichiers
          </a>
        </p>
        <p style="font-size:12px; color:#999;">Ce lien est personnel et valable 30 jours. Ne le partagez pas.</p>
        ${whatsappNote}
      </div>
    `,
  });
}
// Email envoyé par l'admin (manuellement depuis le tableau de bord) quand la carte physique part à La Poste.
export async function sendShippingNotificationEmail(order: {
  email: string;
  firstName: string;
  orderNumber: string;
  trackingNumber?: string | null;
}) {
  const config = await getEmailConfig();
  if (!config) {
    console.error("Email non envoyé : Resend n'est pas configuré (voir /admin/integrations).");
    return;
  }

  await config.resend.emails.send({
    from: config.from,
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
  const config = await getEmailConfig();
  if (!config?.adminEmail) return;

  await config.resend.emails.send({
    from: config.from,
    to: config.adminEmail,
    subject: `Nouvelle commande ${order.orderNumber}${order.isPhysical ? " — carte à préparer" : ""}`,
    html: `<p>Nouvelle commande payée : ${order.orderNumber} (${order.vehicleLabel}).</p>
      ${order.isPhysical ? "<p><b>Action requise :</b> préparer et expédier la carte mémoire depuis le tableau de bord admin.</p>" : ""}`,
  });
}
// Email envoyé quand un client demande à réinitialiser son mot de passe.
export async function sendPasswordResetEmail(user: { email: string; firstName: string; resetUrl: string }) {
  const config = await getEmailConfig();
  if (!config) {
    console.error("Email non envoyé : Resend n'est pas configuré (voir /admin/integrations).");
    return;
  }

  await config.resend.emails.send({
    from: config.from,
    to: user.email,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: auto;">
        <h2>Bonjour ${user.firstName},</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous (valable 1 heure) :</p>
        <p style="margin-top:24px;">
          <a href="${user.resetUrl}" style="background:#111; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; display:inline-block;">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p style="font-size:12px; color:#999; margin-top:24px;">
          Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email : votre mot de passe ne changera pas.
        </p>
      </div>
    `,
  });
}
// Message envoyé depuis le formulaire de contact de l'accueil, vers l'adresse
// "Email de contact" configurée dans /admin/apparence. Répond directement au
// visiteur (reply-to) pour pouvoir lui répondre en un clic.
export async function sendContactFormEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  const config = await getEmailConfig();
  if (!config) {
    console.error("Email de contact non envoyé : Resend n'est pas configuré (voir /admin/integrations).");
    return false;
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const contactEmail = settings?.contactEmail;
  if (!contactEmail) {
    console.error("Email de contact non envoyé : aucune adresse de contact configurée (voir /admin/apparence).");
    return false;
  }

  await config.resend.emails.send({
    from: config.from,
    to: contactEmail,
    replyTo: data.email,
    subject: `[Contact site] ${data.subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: auto;">
        <h2>Nouveau message depuis le formulaire de contact</h2>
        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding:6px 0; color:#666;">Nom</td><td>${data.firstName} ${data.lastName}</td></tr>
          <tr><td style="padding:6px 0; color:#666;">Email</td><td>${data.email}</td></tr>
          <tr><td style="padding:6px 0; color:#666;">Téléphone</td><td>${data.phone || "—"}</td></tr>
          <tr><td style="padding:6px 0; color:#666;">Objet</td><td>${data.subject}</td></tr>
        </table>
        <p style="white-space:pre-wrap; border-top:1px solid #eee; padding-top:12px;">${data.message}</p>
      </div>
    `,
  });

  return true;
}