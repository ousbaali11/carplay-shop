import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Sert un fichier d'activation précis (uniquement livrés pour la formule "fichiers seuls").
export async function GET(req: Request, { params }: { params: { token: string; fileId: string } }) {
  const order = await prisma.order.findUnique({ where: { downloadToken: params.token } });

  const expired = order?.downloadExpiresAt ? new Date() > order.downloadExpiresAt : true;
  const valid =
    order &&
    !expired &&
    order.formula === "FILES_ONLY" &&
    ["PAID", "PREPARING", "SHIPPED"].includes(order.status);
  if (!valid) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 403 });
  }

  const file = await prisma.orderActivationFile.findFirst({ where: { id: params.fileId, orderId: order!.id } });
  if (!file) {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }

  await prisma.order.update({ where: { id: order!.id }, data: { downloadCount: { increment: 1 } } });

  return new NextResponse(file.data as any, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${file.fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
