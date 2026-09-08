import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { parseVehicleForm, pickFiles, readImageUpload, readPdfUpload } from "@/lib/uploads";

function backWithError(req: Request, message: string) {
  const url = new URL("/admin/vehicules/nouveau", req.url);
  url.searchParams.set("erreur", message);
  return NextResponse.redirect(url, 303);
}

// Création d'une nouvelle fiche véhicule. Photos communes aux deux formules,
// PDF séparés par formule (upload). Les liens Google Drive de la formule
// "fichiers seuls" se saisissent commande par commande, depuis l'admin des
// commandes — plus au niveau de la fiche véhicule.
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const formData = await req.formData();
  const parsed = parseVehicleForm(formData);
  if (!parsed.ok) return backWithError(req, parsed.error);
  const { title, description, priceFilesCents, pricePhysicalCents, active, activationTypeId } = parsed.data;

  if (activationTypeId) {
    const exists = await prisma.activationType.findUnique({ where: { id: activationTypeId } });
    if (!exists) return backWithError(req, "Type d'activation introuvable.");
  }

  // Tous les fichiers sont lus et validés AVANT de créer la fiche : soit tout
  // passe, soit rien n'est enregistré.
  const images: { buf: Buffer; mimeType: string; fileName: string }[] = [];
  for (const f of pickFiles(formData, "images")) {
    const r = await readImageUpload(f);
    if ("error" in r) return backWithError(req, r.error);
    images.push(r);
  }
  const pdfsPhysicalCard: { buf: Buffer; fileName: string }[] = [];
  for (const f of pickFiles(formData, "pdfsPhysicalCard")) {
    const r = await readPdfUpload(f);
    if ("error" in r) return backWithError(req, r.error);
    pdfsPhysicalCard.push(r);
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      title,
      description,
      priceFilesCents,
      pricePhysicalCents,
      active,
      activationTypeId,
      images: {
        create: images.map((img, i) => ({ data: img.buf, mimeType: img.mimeType, fileName: img.fileName, position: i })),
      },
      pdfs: {
        create: pdfsPhysicalCard.map((p, i) => ({ formula: "PHYSICAL_CARD" as const, data: p.buf, fileName: p.fileName, position: i })),
      },
    },
  });

  return NextResponse.redirect(new URL(`/admin/vehicules?cree=${encodeURIComponent(vehicle.title)}`, req.url), 303);
}
