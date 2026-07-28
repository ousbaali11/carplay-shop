import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

// La clé Stripe est lue en base à chaque appel (réglable depuis /admin/integrations,
// sans redéploiement). getStripeClient() renvoie null si aucune clé n'est configurée.
export async function getStripeClient(): Promise<Stripe | null> {
  const settings = await prisma.paymentSettings.findUnique({ where: { id: "singleton" } });
  if (!settings?.stripeSecretKey) return null;
  return new Stripe(settings.stripeSecretKey);
}

export async function getStripeWebhookSecret(): Promise<string | null> {
  const settings = await prisma.paymentSettings.findUnique({ where: { id: "singleton" } });
  return settings?.stripeWebhookSecret || null;
}