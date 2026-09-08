import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// Supprime un PDF, uniquement s'il appartient bien au véhicule de l'URL.
export async function DELETE(req: Request, { params }: { params: { id: string; pdfId: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  const result = await prisma.vehiclePdf.deleteMany({ where: { id: params.pdfId, vehicleId: params.id } });
  if (result.count === 0) return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  return NextResponse.json({ success: true });
}
