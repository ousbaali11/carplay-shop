import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeFileName } from "@/lib/html";

// Sert un PDF précis parmi ceux livrés avec la commande (copie figée au paiement).
// À usage unique : un PDF déjà téléchargé une fois ne peut plus l'être (anti-fraude).
export async function GET(req: Request, { params }: { params: { token: string; pdfId: string } }) {
  if (!params.token || params.token.length > 128) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({ where: { downloadToken: params.token } });

  const expired = order?.downloadExpiresAt ? new Date() > order.downloadExpiresAt : true;
  const valid = order && !expired && ["PAID", "PREPARING", "SHIPPED", "COMPLETED"].includes(order.status);
  if (!valid) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 403 });
  }

  const pdf = await prisma.orderPdf.findFirst({ where: { id: params.pdfId, orderId: order.id } });
  if (!pdf) {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }

  // Marqué comme téléchargé AVANT de servir le fichier, de façon ATOMIQUE :
  // deux requêtes simultanées avec le même lien ne peuvent pas passer toutes
  // les deux (une seule met à jour la ligne encore "non téléchargée").
  const claimed = await prisma.orderPdf.updateMany({
    where: { id: pdf.id, orderId: order.id, downloaded: false },
    data: { downloaded: true, downloadedAt: new Date() },
  });
  if (claimed.count === 0) {
    return NextResponse.json({ error: "Ce PDF a déjà été téléchargé et ne peut l'être qu'une seule fois." }, { status: 403 });
  }
  await prisma.order.update({ where: { id: order.id }, data: { downloadCount: { increment: 1 } } });

  const fileName = safeFileName(pdf.fileName.toLowerCase().endsWith(".pdf") ? pdf.fileName : `${pdf.fileName}.pdf`, "guide.pdf");
  return new NextResponse(pdf.data as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
