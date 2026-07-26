import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === "ADMIN";
}

async function createMany(files: File[], creator: (buf: Buffer, file: File, pos: number) => Promise<any>, startPos: number) {
  let pos = startPos;
  for (const f of files) {
    if (f.size > 0) {
      await creator(Buffer.from(await f.arrayBuffer()), f, pos++);
    }
  }
}

// Création d'une nouvelle fiche véhicule. Photos communes aux deux formules ;
// PDF et fichiers d'activation séparés par formule (étapes et fichiers différents).
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const formData = await req.formData();
  const brand = formData.get("brand") as string;
  const model = formData.get("model") as string;
  const year = formData.get("year") as string;
  const description = (formData.get("description") as string) || null;
  const priceFilesEur = formData.get("priceFilesEur") as string;
  const pricePhysicalEur = formData.get("pricePhysicalEur") as string;
  const active = formData.get("active") === "on";

  const images = formData.getAll("images") as File[];
  const pdfsFilesOnly = formData.getAll("pdfsFilesOnly") as File[];
  const pdfsPhysicalCard = formData.getAll("pdfsPhysicalCard") as File[];
  const activationFilesFilesOnly = formData.getAll("activationFilesFilesOnly") as File[];
  const activationFilesPhysicalCard = formData.getAll("activationFilesPhysicalCard") as File[];

  const vehicle = await prisma.vehicle.create({
    data: {
      brand,
      model,
      year,
      description,
      priceFilesCents: Math.round(parseFloat(priceFilesEur || "0") * 100),
      pricePhysicalCents: Math.round(parseFloat(pricePhysicalEur || "0") * 100),
      active,
    },
  });

  await createMany(images, (buf, file, pos) =>
    prisma.vehicleImage.create({ data: { vehicleId: vehicle.id, data: buf, mimeType: file.type || "image/jpeg", fileName: file.name, position: pos } }), 0);

  await createMany(pdfsFilesOnly, (buf, file, pos) =>
    prisma.vehiclePdf.create({ data: { vehicleId: vehicle.id, formula: "FILES_ONLY", data: buf, fileName: file.name, position: pos } }), 0);

  await createMany(pdfsPhysicalCard, (buf, file, pos) =>
    prisma.vehiclePdf.create({ data: { vehicleId: vehicle.id, formula: "PHYSICAL_CARD", data: buf, fileName: file.name, position: pos } }), 0);

  await createMany(activationFilesFilesOnly, (buf, file, pos) =>
    prisma.vehicleActivationFile.create({ data: { vehicleId: vehicle.id, formula: "FILES_ONLY", data: buf, fileName: file.name, position: pos } }), 0);

  await createMany(activationFilesPhysicalCard, (buf, file, pos) =>
    prisma.vehicleActivationFile.create({ data: { vehicleId: vehicle.id, formula: "PHYSICAL_CARD", data: buf, fileName: file.name, position: pos } }), 0);

  return NextResponse.redirect(new URL(`/admin/vehicules?cree=${encodeURIComponent(`${vehicle.brand} ${vehicle.model}`)}`, req.url), 303);
}
