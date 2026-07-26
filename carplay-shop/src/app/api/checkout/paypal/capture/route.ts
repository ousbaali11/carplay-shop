import { NextResponse } from "next/server";
import { capturePaypalOrder } from "@/lib/paypal";
import { finalizeOrderPayment } from "@/lib/orders";

// Le bouton PayPal appelle cette route après approbation par le client.
// La capture ci-dessous est l'étape serveur qui encaisse réellement les fonds :
// c'est seulement après son succès qu'on débloque le PDF.
export async function POST(req: Request) {
  const { orderId, paypalOrderId } = await req.json();

  const capture = await capturePaypalOrder(paypalOrderId);
  const status = capture?.status;

  if (status !== "COMPLETED") {
    return NextResponse.json({ error: "Paiement non confirmé par PayPal" }, { status: 402 });
  }

  const paymentRef = capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id || paypalOrderId;
  await finalizeOrderPayment(orderId, "PAYPAL", paymentRef);

  return NextResponse.json({ success: true });
}
