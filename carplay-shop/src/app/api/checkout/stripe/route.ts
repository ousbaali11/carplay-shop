import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/orders";

export async function POST(req: Request) {
  const settings = await getSettings();
  if (!settings.stripeEnabled) {
    return NextResponse.json({ error: "Le paiement par carte bancaire est momentanément indisponible." }, { status: 403 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe n'est pas configuré (STRIPE_SECRET_KEY manquant dans .env). Voir le README, partie A.7." },
      { status: 500 }
    );
  }

  const { orderId } = await req.json();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const label = `${order.vehicleBrand} ${order.vehicleModel} (${order.vehicleYear}) — ${
    order.formula === "PHYSICAL_CARD" ? "Carte mémoire" : "Fichiers seuls"
  }`;

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: order.email,
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
      // Ce metadata est utilisé par le webhook pour retrouver et valider la commande.
      metadata: { orderId: order.id },
      // session_id permet à la page de confirmation de vérifier le paiement même si
      // le webhook n'est pas encore configuré (utile notamment en test local).
      success_url: `${siteUrl}/commande/confirmation?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?vehicule=${order.vehicleId}&formule=${order.formula}&annule=1`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    console.error("Erreur Stripe:", err);
    return NextResponse.json({ error: `Erreur Stripe : ${err.message || "clé invalide ou mal configurée"}` }, { status: 500 });
  }
}
