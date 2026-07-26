import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Supprime un compte CLIENT. Les commandes déjà passées par ce client restent en
// base (userId devient simplement null), rien n'est perdu côté historique commande.
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  if (target.role === "ADMIN") {
    return NextResponse.json({ error: "Impossible de supprimer un compte administrateur depuis cette page." }, { status: 403 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
