import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/invoice";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const pdf = await generateInvoicePdf({
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    firstName: order.firstName,
    lastName: order.lastName,
    email: order.email,
    address: order.address,
    addressComp: order.addressComp,
    postalCode: order.postalCode,
    city: order.city,
    country: order.country,
    vehicleBrand: order.vehicleBrand,
    vehicleModel: order.vehicleModel,
    vehicleYear: order.vehicleYear,
    formula: order.formula,
    priceCents: order.priceCents,
    paymentMethod: order.paymentMethod,
  });

  return new NextResponse(pdf as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="facture-${order.orderNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
