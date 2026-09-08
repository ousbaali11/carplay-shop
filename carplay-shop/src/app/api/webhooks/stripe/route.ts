import { NextResponse } from "next/server";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";
import { finalizeOrderPayment } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const runtime = "nodejs";

// Stripe envoie cet événement uniquement une fois le paiement réellement encaissé.
// C'est LA source de vérité : on ne débloque jamais le PDF avant ce webhook.
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

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

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (!orderId) return NextResponse.json({ received: true, ignored: "pas d'orderId" });

    // "completed" peut arriver avec un paiement encore en attente (moyens de
    // paiement asynchrones) : on ne livre que si Stripe confirme "paid".
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true, ignored: `payment_status=${session.payment_status}` });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      console.error(`Webhook Stripe : commande ${orderId} introuvable.`);
      return NextResponse.json({ received: true, ignored: "commande introuvable" });
    }

    // Contrôle du montant réellement encaissé : la session a été créée par notre
    // serveur avec le prix de la commande, elle doit donc correspondre exactement.
    const currencyOk = (session.currency || "").toLowerCase() === "eur";
    if (!currencyOk || session.amount_total !== order.priceCents) {
      console.error(
        `Webhook Stripe : montant incohérent pour ${order.orderNumber} (attendu ${order.priceCents}, reçu ${session.amount_total} ${session.currency}). Commande laissée en attente.`
      );
      return NextResponse.json({ received: true, ignored: "montant incohérent" });
    }

    try {
      const paymentRef = typeof session.payment_intent === "string" ? session.payment_intent : session.id;
      await finalizeOrderPayment(order.id, "STRIPE", paymentRef);
    } catch (err) {
      // 500 => Stripe réessaiera plus tard (erreur ponctuelle de base, etc.).
      console.error(`Webhook Stripe : échec de finalisation de ${order.orderNumber} :`, err);
      return NextResponse.json({ error: "Finalisation échouée, nouvel essai attendu." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
