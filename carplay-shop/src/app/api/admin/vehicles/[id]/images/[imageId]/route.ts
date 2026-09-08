import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// Supprime une photo, uniquement si elle appartient bien au véhicule de l'URL.
export async function DELETE(req: Request, { params }: { params: { id: string; imageId: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  const result = await prisma.vehicleImage.deleteMany({ where: { id: params.imageId, vehicleId: params.id } });
  if (result.count === 0) return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });
  return NextResponse.json({ success: true });
}
