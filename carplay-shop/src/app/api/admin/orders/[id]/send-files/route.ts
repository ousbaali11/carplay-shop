import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendFilesReadyEmail } from "@/lib/email";
import { getSiteSettings } from "@/lib/orders";

function parseLinks(raw: string): string[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

// Formule "fichiers seuls" uniquement. Ajoute les liens Google Drive fournis à
// cette commande précise, puis envoie l'email "vos fichiers sont prêts" au
// client — c'est CE moment qui active le bouton "Accéder" côté client.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { links } = await req.json();
  const newLinks = parseLinks(links || "");

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }
  if (order.formula !== "FILES_ONLY") {
    return NextResponse.json({ error: "Cette action n'est disponible que pour la formule fichiers seuls." }, { status: 400 });
  }
  if (!order.downloadToken) {
    return NextResponse.json({ error: "Le paiement de cette commande n'est pas encore confirmé." }, { status: 400 });
  }

  if (newLinks.length > 0) {
    const count = await prisma.orderActivationLink.count({ where: { orderId: order.id } });
    let pos = count;
    for (const url of newLinks) {
      await prisma.orderActivationLink.create({ data: { orderId: order.id, url, position: pos++ } });
    }
  }

  const totalLinks = await prisma.orderActivationLink.count({ where: { orderId: order.id } });
  if (totalLinks === 0) {
    return NextResponse.json({ error: "Ajoute au moins un lien avant d'envoyer." }, { status: 400 });
  }

  await prisma.order.update({ where: { id: order.id }, data: { filesSentAt: new Date() } });

  const { whatsappUrl } = await getSiteSettings();
  await sendFilesReadyEmail({
    email: order.email,
    firstName: order.firstName,
    orderNumber: order.orderNumber,
    vehicleLabel: `${order.vehicleBrand} ${order.vehicleModel} (${order.vehicleYear})`,
    downloadToken: order.downloadToken,
    whatsappUrl,
  });

  return NextResponse.json({ success: true });
}
