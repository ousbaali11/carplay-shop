import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getPaymentSettings } from "@/lib/orders";

export async function POST(req: Request) {
  const settings = await getPaymentSettings();
  if (!settings.stripeEnabled) {
    return NextResponse.json({ error: "Le paiement par carte bancaire est momentanément indisponible." }, { status: 403 });
  }

  const stripe = await getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe n'est pas configuré. Va dans /admin/integrations pour ajouter ta clé secrète." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const orderId = body?.orderId;
  if (typeof orderId !== "string" || !orderId || orderId.length > 64) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  if (order.status !== "PENDING_PAYMENT") {
    return NextResponse.json({ error: "Cette commande a déjà été payée." }, { status: 400 });
  }
  if (order.priceCents <= 0) {
    return NextResponse.json({ error: "Montant de commande invalide." }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const label = `${order.vehicleTitle} (${order.vehicleYear}) — ${
    order.formula === "PHYSICAL_CARD" ? "Carte mémoire" : "Fichiers seuls"
  }`.slice(0, 250);

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: order.email,
      client_reference_id: order.id,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: label },
            unit_amount: order.priceCents,
          },
          quantity: 1,
        },
      ],
      // Ce metadata est utilisé par le webhook ET la page de confirmation pour
      // retrouver la commande et vérifier que la session paie bien CETTE commande.
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      // session_id permet à la page de confirmation de vérifier le paiement même si
      // le webhook n'est pas encore configuré (utile notamment en test local).
      success_url: `${siteUrl}/commande/confirmation?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?vehicule=${order.vehicleId ?? ""}&formule=${
        order.formula === "PHYSICAL_CARD" ? "carte" : "fichiers"
      }&annule=1`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    console.error("Erreur Stripe:", err);
    return NextResponse.json({ error: `Erreur Stripe : ${err?.message || "clé invalide ou mal configurée"}` }, { status: 500 });
  }
}
