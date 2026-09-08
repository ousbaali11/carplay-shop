import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { sendShippingNotificationEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const rawTracking = body?.trackingNumber;
  if (rawTracking !== undefined && rawTracking !== null && typeof rawTracking !== "string") {
    return NextResponse.json({ error: "Numéro de suivi invalide" }, { status: 400 });
  }
  const trackingNumber = typeof rawTracking === "string" ? rawTracking.trim().slice(0, 100) : "";

  const existing = await prisma.order.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  if (existing.formula !== "PHYSICAL_CARD") {
    return NextResponse.json({ error: "Seule une commande carte physique peut être expédiée." }, { status: 400 });
  }
  if (existing.status === "PENDING_PAYMENT" || existing.status === "CANCELED" || existing.status === "REFUNDED") {
    return NextResponse.json({ error: "Cette commande n'est pas payée : impossible de l'expédier." }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status: "SHIPPED", trackingNumber: trackingNumber || null, shippedAt: new Date() },
  });

  try {
    await sendShippingNotificationEmail({
      email: order.email,
      firstName: order.firstName,
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber,
    });
  } catch (err) {
    console.error(`Email d'expédition non envoyé pour ${order.orderNumber} :`, err);
    return NextResponse.json({ success: true, emailSent: false });
  }

  return NextResponse.json({ success: true, emailSent: true });
}
