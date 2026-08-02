import { NextResponse } from "next/server";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";
import { finalizeOrderPayment } from "@/lib/orders";
import Stripe from "stripe";

export const runtime = "nodejs";

// Stripe envoie cet événement uniquement une fois le paiement réellement encaissé.
// C'est LA source de vérité : on ne débloque jamais le PDF avant ce webhook.
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  const stripe = await getStripeClient();
  const webhookSecret = await getStripeWebhookSecret();
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe n'est pas configuré côté serveur." }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Signature invalide: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await finalizeOrderPayment(orderId, "STRIPE", session.payment_intent as string);
    }
  }

  return NextResponse.json({ received: true });
}
