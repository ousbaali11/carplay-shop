import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const MAX_LEN = 500;
// Accepte "adresse@domaine.fr" ou "Nom <adresse@domaine.fr>" (format Resend).
const FROM_RE = /^(?:[^<>\r\n]{1,100}<)?[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>?$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Les champs secrets ne sont mis à jour QUE si une nouvelle valeur non vide est
// envoyée (un champ laissé vide dans le formulaire = "je ne change pas ce secret").
// Répartit les champs entre PaymentSettings (Stripe/PayPal) et SiteSettings
// (Resend, société) — deux tables propres et séparées en base.
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const paymentData: Record<string, string> = {};
  const siteData: Record<string, string> = {};

  const str = (field: string): string | null => {
    const v = body[field];
    if (typeof v !== "string") return null;
    if (v.length > MAX_LEN) throw new Error(`Le champ ${field} est trop long.`);
    return v.trim();
  };

  try {
    for (const field of ["stripeSecretKey", "stripeWebhookSecret", "paypalClientSecret"]) {
      const v = str(field);
      if (v) paymentData[field] = v;
    }
    const paypalClientId = str("paypalClientId");
    if (paypalClientId !== null) paymentData.paypalClientId = paypalClientId;

    const paypalEnv = str("paypalEnv");
    if (paypalEnv !== null) {
      if (paypalEnv !== "sandbox" && paypalEnv !== "live") {
        return NextResponse.json({ error: "Environnement PayPal invalide (sandbox ou live)" }, { status: 400 });
      }
      paymentData.paypalEnv = paypalEnv;
    }

    const resendApiKey = str("resendApiKey");
    if (resendApiKey) siteData.resendApiKey = resendApiKey;

    const emailFrom = str("emailFrom");
    if (emailFrom !== null) {
      if (!emailFrom || !FROM_RE.test(emailFrom)) {
        return NextResponse.json({ error: "Adresse d'expédition invalide" }, { status: 400 });
      }
      siteData.emailFrom = emailFrom;
    }

    const adminNotificationEmail = str("adminNotificationEmail");
    if (adminNotificationEmail !== null) {
      if (adminNotificationEmail && !EMAIL_RE.test(adminNotificationEmail)) {
        return NextResponse.json({ error: "Email admin invalide" }, { status: 400 });
      }
      siteData.adminNotificationEmail = adminNotificationEmail;
    }

    for (const field of ["companyName", "companyAddress"]) {
      const v = str(field);
      if (v !== null) siteData[field] = v;
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Requête invalide" }, { status: 400 });
  }

  if (Object.keys(paymentData).length > 0) {
    await prisma.paymentSettings.upsert({
      where: { id: "singleton" },
      update: paymentData,
      create: { id: "singleton", ...paymentData },
    });
  }

  if (Object.keys(siteData).length > 0) {
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: siteData,
      create: { id: "singleton", ...siteData },
    });
  }

  return NextResponse.json({ success: true });
}
