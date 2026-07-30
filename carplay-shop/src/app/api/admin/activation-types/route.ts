import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === "ADMIN";
}

// Crée un nouveau type d'activation (la "clé") avec un ou plusieurs PDF (la "valeur").
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const formData = await req.formData();
  const name = ((formData.get("name") as string) || "").trim();
  const files = formData.getAll("pdfs") as File[];

  if (!name) {
    return NextResponse.json({ error: "Le nom (la clé) est obligatoire" }, { status: 400 });
  }

  const existing = await prisma.activationType.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json({ error: "Ce nom existe déjà dans la liste." }, { status: 400 });
  }

  const activationType = await prisma.activationType.create({ data: { name } });

  let pos = 0;
  for (const f of files) {
    if (f.size > 0) {
      const buf = Buffer.from(await f.arrayBuffer());
      await prisma.activationTypePdf.create({
        data: { activationTypeId: activationType.id, data: buf, fileName: f.name, position: pos++ },
      });
    }
  }

  return NextResponse.redirect(new URL("/admin/activations", req.url), 303);
}
