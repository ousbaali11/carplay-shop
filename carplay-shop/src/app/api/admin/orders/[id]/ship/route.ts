import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendShippingNotificationEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { trackingNumber } = await req.json();

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status: "SHIPPED", trackingNumber: trackingNumber || null, shippedAt: new Date() },
  });

  await sendShippingNotificationEmail({
    email: order.email,
    firstName: order.firstName,
    orderNumber: order.orderNumber,
    trackingNumber: order.trackingNumber,
  });

  return NextResponse.json({ success: true });
}
