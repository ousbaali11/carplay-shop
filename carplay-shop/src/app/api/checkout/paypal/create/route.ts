import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaypalOrder } from "@/lib/paypal";
import { getPaymentSettings } from "@/lib/orders";

export async function POST(req: Request) {
  const settings = await getPaymentSettings();
  if (!settings.paypalEnabled) {
    return NextResponse.json({ error: "PayPal est momentanément indisponible." }, { status: 403 });
  }
  if (!settings.paypalClientId || !settings.paypalClientSecret) {
    return NextResponse.json(
      { error: "PayPal n'est pas configuré. Va dans /admin/integrations pour ajouter tes identifiants." },
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

  try {
    const paypalOrder = await createPaypalOrder(order.priceCents, order.orderNumber);
    if (!paypalOrder?.id) {
      console.error("Réponse PayPal inattendue:", paypalOrder);
      return NextResponse.json({ error: "PayPal n'a pas pu créer la commande (identifiants invalides ?)." }, { status: 500 });
    }
    return NextResponse.json({ id: paypalOrder.id });
  } catch (err) {
    console.error("Erreur PayPal:", err);
    return NextResponse.json({ error: "Erreur lors de la connexion à PayPal." }, { status: 500 });
  }
}
