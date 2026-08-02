import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/invoice";
import { getSiteSettings } from "@/lib/orders";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { token: string } }) {
  const settings = await getSiteSettings();
  if (!settings.invoicesEnabled) {
    return NextResponse.json({ error: "Les factures ne sont pas disponibles pour le moment." }, { status: 403 });
  }

  const order = await prisma.order.findUnique({ where: { downloadToken: params.token } });

  const expired = order?.downloadExpiresAt ? new Date() > order.downloadExpiresAt : true;
  const valid = order && !expired && order.status !== "PENDING_PAYMENT" && order.status !== "CANCELED";
  if (!valid) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 403 });
  }

  try {
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
      vehicleTitle: order!.vehicleTitle,
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
  } catch (err: any) {
    console.error("Erreur génération facture:", err);
    return NextResponse.json({ error: `Impossible de générer la facture : ${err.message}` }, { status: 500 });
  }
}
