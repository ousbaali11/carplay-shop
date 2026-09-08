import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { isSafeHttpUrl } from "@/lib/html";

// Enregistre le lien de la vidéo (qu'il vienne d'un upload Vercel Blob ou d'un
// lien externe collé à la main) — ou l'efface pour revenir à l'animation par défaut.
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const videoUrl = body?.videoUrl;
  const remove = !!body?.remove;

  if (remove) {
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: { heroVideoUrl: null },
      create: { id: "singleton", heroVideoUrl: null },
    });
    return NextResponse.json({ success: true });
  }

  // Ce lien est mis dans <video src=...> sur la page d'accueil : uniquement http(s).
  if (!isSafeHttpUrl(videoUrl)) {
    return NextResponse.json({ error: "Lien manquant ou invalide (une URL complète https://... est attendue)" }, { status: 400 });
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { heroVideoUrl: videoUrl.trim() },
    create: { id: "singleton", heroVideoUrl: videoUrl.trim() },
  });

  return NextResponse.json({ success: true });
}
