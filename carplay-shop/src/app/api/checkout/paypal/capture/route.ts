import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { capturePaypalOrder, verifyPaypalCapture } from "@/lib/paypal";
import { finalizeOrderPayment } from "@/lib/orders";

// Le bouton PayPal appelle cette route après approbation par le client.
// La capture ci-dessous est l'étape serveur qui encaisse réellement les fonds :
// c'est seulement après son succès — ET après vérification que ce paiement
// PayPal correspond bien à cette commande (référence + montant) — qu'on
// débloque les fichiers.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const orderId = body?.orderId;
  const paypalOrderId = body?.paypalOrderId;
  if (
    typeof orderId !== "string" || !orderId || orderId.length > 64 ||
    typeof paypalOrderId !== "string" || !paypalOrderId || paypalOrderId.length > 64
  ) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  if (order.status !== "PENDING_PAYMENT") {
    // Déjà payée (par PayPal ou autre) : on n'encaisse surtout pas une seconde fois.
    return NextResponse.json({ success: true, alreadyPaid: true });
  }

  let capture;
  try {
    capture = await capturePaypalOrder(paypalOrderId);
  } catch (err) {
    console.error("Erreur capture PayPal:", err);
    return NextResponse.json({ error: "Impossible de contacter PayPal pour confirmer le paiement." }, { status: 502 });
  }

  const verified = verifyPaypalCapture(capture, { orderNumber: order.orderNumber, priceCents: order.priceCents });
  if (!verified.ok) {
    console.warn(`Capture PayPal refusée pour ${order.orderNumber} (${paypalOrderId}) : ${verified.error}`);
    return NextResponse.json({ error: verified.error }, { status: 402 });
  }

  await finalizeOrderPayment(order.id, "PAYPAL", verified.paymentRef);

  return NextResponse.json({ success: true });
}
