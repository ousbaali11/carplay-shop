import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { pickFiles, readPdfUpload } from "@/lib/uploads";

function backWithError(req: Request, message: string) {
  const url = new URL("/admin/activations/nouveau", req.url);
  url.searchParams.set("erreur", message);
  return NextResponse.redirect(url, 303);
}

// Crée un nouveau type d'activation (la "clé") avec un ou plusieurs PDF (la "valeur").
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const formData = await req.formData();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return backWithError(req, "Le nom (la clé) est obligatoire.");
  if (name.length > 120) return backWithError(req, "Le nom est trop long (120 caractères max).");

  // Tous les fichiers sont lus et validés AVANT de créer quoi que ce soit.
  const pdfs: { buf: Buffer; fileName: string }[] = [];
  for (const f of pickFiles(formData, "pdfs")) {
    const r = await readPdfUpload(f);
    if ("error" in r) return backWithError(req, r.error);
    pdfs.push(r);
  }

  try {
    await prisma.activationType.create({
      data: {
        name,
        pdfs: { create: pdfs.map((p, i) => ({ data: p.buf, fileName: p.fileName, position: i })) },
      },
    });
  } catch (err: any) {
    if (err?.code === "P2002") return backWithError(req, "Ce nom existe déjà dans la liste.");
    throw err;
  }

  return NextResponse.redirect(new URL("/admin/activations", req.url), 303);
}
