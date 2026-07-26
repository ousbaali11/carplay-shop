import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Réservé à l'admin : télécharge un fichier d'activation "carte physique" du
// véhicule commandé, pour préparer la carte mémoire à expédier.
export async function GET(req: Request, { params }: { params: { id: string; fileId: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order?.vehicleId) {
    return NextResponse.json({ error: "Véhicule introuvable (peut-être supprimé du catalogue)" }, { status: 404 });
  }

  const file = await prisma.vehicleActivationFile.findFirst({
    where: { id: params.fileId, vehicleId: order.vehicleId, formula: "PHYSICAL_CARD" },
  });
  if (!file) {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }

  return new NextResponse(file.data as any, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${file.fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
