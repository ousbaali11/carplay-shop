import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/invoice";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { token: string } }) {
  const order = await prisma.order.findUnique({ where: { downloadToken: params.token } });

  const expired = order?.downloadExpiresAt ? new Date() > order.downloadExpiresAt : true;
  const valid = order && !expired && order.status !== "PENDING_PAYMENT" && order.status !== "CANCELED";
  if (!valid) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 403 });
  }

  const pdf = await generateInvoicePdf({
    orderNumber: order!.orderNumber,
    createdAt: order!.createdAt,
    firstName: order!.firstName,
    lastName: order!.lastName,
    email: order!.email,
    address: order!.address,
    addressComp: order!.addressComp,
    postalCode: order!.postalCode,
    city: order!.city,
    country: order!.country,
    vehicleBrand: order!.vehicleBrand,
    vehicleModel: order!.vehicleModel,
    vehicleYear: order!.vehicleYear,
    formula: order!.formula,
    priceCents: order!.priceCents,
    paymentMethod: order!.paymentMethod,
  });

  return new NextResponse(pdf as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="facture-${order!.orderNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
