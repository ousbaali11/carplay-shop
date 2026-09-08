import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { sendFilesReadyEmail } from "@/lib/email";
import { getSiteSettings } from "@/lib/orders";
import { isSafeHttpUrl } from "@/lib/html";

const MAX_LINKS_PER_ORDER = 30;

function parseLinks(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

// Formule "fichiers seuls" uniquement. Ajoute les liens Google Drive fournis à
// cette commande précise, puis envoie l'email "vos fichiers sont prêts" au
// client — c'est CE moment qui active le bouton "Accéder" côté client.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const rawLinks = body?.links ?? "";
  if (typeof rawLinks !== "string" || rawLinks.length > 20000) {
    return NextResponse.json({ error: "Liens invalides" }, { status: 400 });
  }
  const newLinks = parseLinks(rawLinks);

  // Le client sera REDIRIGÉ vers ces liens : uniquement des URLs http(s) valides.
  const invalid = newLinks.find((l) => !isSafeHttpUrl(l));
  if (invalid) {
    return NextResponse.json({ error: `Lien invalide (une URL complète https://... est attendue) : ${invalid.slice(0, 80)}` }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }
  if (order.formula !== "FILES_ONLY") {
    return NextResponse.json({ error: "Cette action n'est disponible que pour la formule fichiers seuls." }, { status: 400 });
  }
  if (!order.downloadToken || order.status === "PENDING_PAYMENT" || order.status === "CANCELED" || order.status === "REFUNDED") {
    return NextResponse.json({ error: "Le paiement de cette commande n'est pas confirmé." }, { status: 400 });
  }

  const count = await prisma.orderActivationLink.count({ where: { orderId: order.id } });
  if (count + newLinks.length > MAX_LINKS_PER_ORDER) {
    return NextResponse.json({ error: `Trop de liens pour une seule commande (${MAX_LINKS_PER_ORDER} max).` }, { status: 400 });
  }

  if (newLinks.length > 0) {
    await prisma.orderActivationLink.createMany({
      data: newLinks.map((url, i) => ({ orderId: order.id, url, position: count + i })),
    });
  }

  const totalLinks = count + newLinks.length;
  if (totalLinks === 0) {
    return NextResponse.json({ error: "Ajoute au moins un lien avant d'envoyer." }, { status: 400 });
  }

  await prisma.order.update({ where: { id: order.id }, data: { filesSentAt: new Date() } });

  try {
    const { whatsappUrl } = await getSiteSettings();
    await sendFilesReadyEmail({
      email: order.email,
      firstName: order.firstName,
      orderNumber: order.orderNumber,
      vehicleLabel: `${order.vehicleTitle} (${order.vehicleYear})`,
      downloadToken: order.downloadToken,
      whatsappUrl,
    });
  } catch (err) {
    console.error(`Email "fichiers prêts" non envoyé pour ${order.orderNumber} :`, err);
    return NextResponse.json({ error: "Liens enregistrés, mais l'email n'a pas pu être envoyé. Réessaie l'envoi." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
