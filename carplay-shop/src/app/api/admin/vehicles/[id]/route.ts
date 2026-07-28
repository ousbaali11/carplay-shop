import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === "ADMIN";
}

async function appendMany(files: File[], startPos: number, creator: (buf: Buffer, file: File, pos: number) => Promise<any>) {
  let pos = startPos;
  for (const f of files) {
    if (f.size > 0) {
      await creator(Buffer.from(await f.arrayBuffer()), f, pos++);
    }
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  const vehicleId = params.id;

  const formData = await req.formData();
  const brand = formData.get("brand") as string;
  const model = formData.get("model") as string;
  const year = formData.get("year") as string;
  const description = (formData.get("description") as string) || null;
  const priceFilesEur = formData.get("priceFilesEur") as string;
  const pricePhysicalEur = formData.get("pricePhysicalEur") as string;
  const active = formData.get("active") === "on";
  const activationLinkFilesOnly = ((formData.get("activationLinkFilesOnly") as string) || "").trim() || null;
  const activationLinkPhysicalCard = ((formData.get("activationLinkPhysicalCard") as string) || "").trim() || null;

  const images = formData.getAll("images") as File[];
  const pdfsFilesOnly = formData.getAll("pdfsFilesOnly") as File[];
  const pdfsPhysicalCard = formData.getAll("pdfsPhysicalCard") as File[];

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      brand,
      model,
      year,
      description,
      priceFilesCents: Math.round(parseFloat(priceFilesEur || "0") * 100),
      pricePhysicalCents: Math.round(parseFloat(pricePhysicalEur || "0") * 100),
      active,
      activationLinkFilesOnly,
      activationLinkPhysicalCard,
    },
  });

  const imgCount = await prisma.vehicleImage.count({ where: { vehicleId } });
  await appendMany(images, imgCount, (buf, file, pos) =>
    prisma.vehicleImage.create({ data: { vehicleId, data: buf, mimeType: file.type || "image/jpeg", fileName: file.name, position: pos } }));

  const pdfFilesOnlyCount = await prisma.vehiclePdf.count({ where: { vehicleId, formula: "FILES_ONLY" } });
  await appendMany(pdfsFilesOnly, pdfFilesOnlyCount, (buf, file, pos) =>
    prisma.vehiclePdf.create({ data: { vehicleId, formula: "FILES_ONLY", data: buf, fileName: file.name, position: pos } }));

  const pdfPhysicalCount = await prisma.vehiclePdf.count({ where: { vehicleId, formula: "PHYSICAL_CARD" } });
  await appendMany(pdfsPhysicalCard, pdfPhysicalCount, (buf, file, pos) =>
    prisma.vehiclePdf.create({ data: { vehicleId, formula: "PHYSICAL_CARD", data: buf, fileName: file.name, position: pos } }));

  return NextResponse.redirect(new URL(`/admin/vehicules/${vehicleId}?enregistre=1`, req.url), 303);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  await prisma.vehicle.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}