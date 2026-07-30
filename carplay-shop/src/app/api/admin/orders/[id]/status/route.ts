import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Contrôle manuel de l'admin sur le statut d'une commande (annulation, remboursement...).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { status } = await req.json();
  const allowed = ["PENDING_PAYMENT", "PAID", "PREPARING", "SHIPPED", "COMPLETED", "CANCELED", "REFUNDED"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  await prisma.order.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json({ success: true });
}
