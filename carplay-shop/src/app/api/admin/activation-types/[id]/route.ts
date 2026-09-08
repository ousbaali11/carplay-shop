import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { pickFiles, readPdfUpload } from "@/lib/uploads";

function backWithError(req: Request, id: string, message: string) {
  const url = new URL(`/admin/activations/${id}`, req.url);
  url.searchParams.set("erreur", message);
  return NextResponse.redirect(url, 303);
}

// Renomme (optionnel) et/ou ajoute de nouveaux PDF à un type d'activation existant.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const existing = await prisma.activationType.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Type d'activation introuvable" }, { status: 404 });

  const formData = await req.formData();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length > 120) return backWithError(req, params.id, "Le nom est trop long (120 caractères max).");

  const pdfs: { buf: Buffer; fileName: string }[] = [];
  for (const f of pickFiles(formData, "pdfs")) {
    const r = await readPdfUpload(f);
    if ("error" in r) return backWithError(req, params.id, r.error);
    pdfs.push(r);
  }

  try {
    if (name && name !== existing.name) {
      await prisma.activationType.update({ where: { id: params.id }, data: { name } });
    }
  } catch (err: any) {
    if (err?.code === "P2002") return backWithError(req, params.id, "Ce nom est déjà utilisé par un autre type d'activation.");
    throw err;
  }

  if (pdfs.length > 0) {
    const count = await prisma.activationTypePdf.count({ where: { activationTypeId: params.id } });
    await prisma.activationTypePdf.createMany({
      data: pdfs.map((p, i) => ({ activationTypeId: params.id, data: p.buf, fileName: p.fileName, position: count + i })),
    });
  }

  return NextResponse.redirect(new URL(`/admin/activations/${params.id}?enregistre=1`, req.url), 303);
}

// Supprime entièrement ce type d'activation (les véhicules qui l'utilisaient
// perdent simplement l'association, ils ne sont pas supprimés).
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  const result = await prisma.activationType.deleteMany({ where: { id: params.id } });
  if (result.count === 0) return NextResponse.json({ error: "Type d'activation introuvable" }, { status: 404 });
  return NextResponse.json({ success: true });
}
