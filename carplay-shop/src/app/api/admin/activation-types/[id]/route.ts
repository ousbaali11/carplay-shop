import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === "ADMIN";
}

// Renomme (optionnel) et/ou ajoute de nouveaux PDF à un type d'activation existant.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const formData = await req.formData();
  const name = ((formData.get("name") as string) || "").trim();
  const files = formData.getAll("pdfs") as File[];

  if (name) {
    await prisma.activationType.update({ where: { id: params.id }, data: { name } });
  }

  const count = await prisma.activationTypePdf.count({ where: { activationTypeId: params.id } });
  let pos = count;
  for (const f of files) {
    if (f.size > 0) {
      const buf = Buffer.from(await f.arrayBuffer());
      await prisma.activationTypePdf.create({
        data: { activationTypeId: params.id, data: buf, fileName: f.name, position: pos++ },
      });
    }
  }

  return NextResponse.redirect(new URL(`/admin/activations/${params.id}?enregistre=1`, req.url), 303);
}

// Supprime entièrement ce type d'activation (les véhicules qui l'utilisaient
// perdent simplement l'association, ils ne sont pas supprimés).
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  await prisma.activationType.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
