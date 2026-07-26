import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Sert un PDF précis parmi ceux livrés avec la commande (copie figée au paiement).
export async function GET(req: Request, { params }: { params: { token: string; pdfId: string } }) {
  const order = await prisma.order.findUnique({ where: { downloadToken: params.token } });

  const expired = order?.downloadExpiresAt ? new Date() > order.downloadExpiresAt : true;
  const valid = order && !expired && ["PAID", "PREPARING", "SHIPPED"].includes(order.status);
  if (!valid) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 403 });
  }

  const pdf = await prisma.orderPdf.findFirst({ where: { id: params.pdfId, orderId: order!.id } });
  if (!pdf) {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }

  await prisma.order.update({ where: { id: order!.id }, data: { downloadCount: { increment: 1 } } });

  return new NextResponse(pdf.data as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdf.fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
