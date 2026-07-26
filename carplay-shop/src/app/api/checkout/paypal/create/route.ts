import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaypalOrder } from "@/lib/paypal";
import { getSettings } from "@/lib/orders";

export async function POST(req: Request) {
  const settings = await getSettings();
  if (!settings.paypalEnabled) {
    return NextResponse.json({ error: "PayPal est momentanément indisponible." }, { status: 403 });
  }
  if (!settings.paypalClientId || !settings.paypalClientSecret) {
    return NextResponse.json(
      { error: "PayPal n'est pas configuré. Va dans /admin/integrations pour ajouter tes identifiants." },
      { status: 500 }
    );
  }

  const { orderId } = await req.json();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  try {
    const paypalOrder = await createPaypalOrder(order.priceCents / 100, order.orderNumber);
    if (!paypalOrder?.id) {
      console.error("Réponse PayPal inattendue:", paypalOrder);
      return NextResponse.json({ error: "PayPal n'a pas pu créer la commande (identifiants invalides ?)." }, { status: 500 });
    }
    return NextResponse.json({ id: paypalOrder.id });
  } catch (err: any) {
    console.error("Erreur PayPal:", err);
    return NextResponse.json({ error: "Erreur lors de la connexion à PayPal." }, { status: 500 });
  }
}
