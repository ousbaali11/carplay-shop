import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Les champs secrets ne sont mis à jour QUE si une nouvelle valeur non vide est
// envoyée (un champ laissé vide dans le formulaire = "je ne change pas ce secret").
// Répartit les champs entre PaymentSettings (Stripe/PayPal) et SiteSettings
// (Resend, société) — deux tables propres et séparées en base.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();

  const paymentData: any = {};
  const siteData: any = {};

  const paymentSecretFields = ["stripeSecretKey", "stripeWebhookSecret", "paypalClientSecret"];
  for (const field of paymentSecretFields) {
    if (typeof body[field] === "string" && body[field].trim() !== "") {
      paymentData[field] = body[field].trim();
    }
  }
  const paymentPlainFields = ["paypalClientId", "paypalEnv"];
  for (const field of paymentPlainFields) {
    if (typeof body[field] === "string") {
      paymentData[field] = body[field].trim();
    }
  }

  if (typeof body.resendApiKey === "string" && body.resendApiKey.trim() !== "") {
    siteData.resendApiKey = body.resendApiKey.trim();
  }
  const sitePlainFields = ["emailFrom", "adminNotificationEmail", "companyName", "companyAddress"];
  for (const field of sitePlainFields) {
    if (typeof body[field] === "string") {
      siteData[field] = body[field].trim();
    }
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
