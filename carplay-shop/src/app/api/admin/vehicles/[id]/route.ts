import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { parseVehicleForm, pickFiles, readImageUpload, readPdfUpload } from "@/lib/uploads";

function backWithError(req: Request, vehicleId: string, message: string) {
  const url = new URL(`/admin/vehicules/${vehicleId}`, req.url);
  url.searchParams.set("erreur", message);
  return NextResponse.redirect(url, 303);
}

// Met à jour les infos/prix, et AJOUTE (sans supprimer l'existant) les nouvelles
// photos / PDF (par formule). Les liens Google Drive se saisissent commande par
// commande, depuis l'admin des commandes.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  const vehicleId = params.id;

  const existing = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!existing) return NextResponse.json({ error: "Véhicule introuvable" }, { status: 404 });

  const formData = await req.formData();
  const parsed = parseVehicleForm(formData);
  if (!parsed.ok) return backWithError(req, vehicleId, parsed.error);
  const { title, description, priceFilesCents, pricePhysicalCents, active, activationTypeId } = parsed.data;

  if (activationTypeId) {
    const exists = await prisma.activationType.findUnique({ where: { id: activationTypeId } });
    if (!exists) return backWithError(req, vehicleId, "Type d'activation introuvable.");
  }

  const images: { buf: Buffer; mimeType: string; fileName: string }[] = [];
  for (const f of pickFiles(formData, "images")) {
    const r = await readImageUpload(f);
    if ("error" in r) return backWithError(req, vehicleId, r.error);
    images.push(r);
  }
  const pdfsPhysicalCard: { buf: Buffer; fileName: string }[] = [];
  for (const f of pickFiles(formData, "pdfsPhysicalCard")) {
    const r = await readPdfUpload(f);
    if ("error" in r) return backWithError(req, vehicleId, r.error);
    pdfsPhysicalCard.push(r);
  }

  const [imgCount, pdfPhysicalCount] = await Promise.all([
    prisma.vehicleImage.count({ where: { vehicleId } }),
    prisma.vehiclePdf.count({ where: { vehicleId, formula: "PHYSICAL_CARD" } }),
  ]);

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      title,
      description,
      priceFilesCents,
      pricePhysicalCents,
      active,
      activationTypeId,
      images: {
        create: images.map((img, i) => ({ data: img.buf, mimeType: img.mimeType, fileName: img.fileName, position: imgCount + i })),
      },
      pdfs: {
        create: pdfsPhysicalCard.map((p, i) => ({
          formula: "PHYSICAL_CARD" as const,
          data: p.buf,
          fileName: p.fileName,
          position: pdfPhysicalCount + i,
        })),
      },
    },
  });

  return NextResponse.redirect(new URL(`/admin/vehicules/${vehicleId}?enregistre=1`, req.url), 303);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  const result = await prisma.vehicle.deleteMany({ where: { id: params.id } });
  if (result.count === 0) return NextResponse.json({ error: "Véhicule introuvable" }, { status: 404 });
  return NextResponse.json({ success: true });
}
