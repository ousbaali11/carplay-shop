import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// Supprime un PDF d'un type d'activation. La suppression est limitée au type
// indiqué dans l'URL : impossible de supprimer un PDF d'un autre type en
// changeant simplement l'identifiant.
export async function DELETE(req: Request, { params }: { params: { id: string; pdfId: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  const result = await prisma.activationTypePdf.deleteMany({
    where: { id: params.pdfId, activationTypeId: params.id },
  });
  if (result.count === 0) return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  return NextResponse.json({ success: true });
}
