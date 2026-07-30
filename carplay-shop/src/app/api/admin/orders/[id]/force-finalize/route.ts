import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { finalizeOrderPayment } from "@/lib/orders";

// Débloque une commande dont le paiement a été reçu mais dont la confirmation
// n'a jamais abouti côté serveur (webhook manqué, erreur ponctuelle...) :
// génère le lien de téléchargement, attache les PDF/liens d'activation, envoie
// l'email de confirmation — exactement comme si le paiement venait de réussir.
//
// Protection : refuse si un lien existe déjà, pour ne jamais dupliquer les
// fichiers d'une commande qui a en réalité déjà été finalisée normalement.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }
  if (order.downloadToken) {
    return NextResponse.json(
      { error: "Cette commande a déjà un lien de téléchargement — elle a déjà été finalisée." },
      { status: 400 }
    );
  }

  try {
    await finalizeOrderPayment(order.id, order.paymentMethod || "STRIPE", order.paymentRef || `recuperation-admin-${Date.now()}`, true);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Échec de la finalisation forcée." }, { status: 500 });
  }
}
