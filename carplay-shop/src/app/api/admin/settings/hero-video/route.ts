import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Enregistre le lien de la vidéo (qu'il vienne d'un upload Vercel Blob ou d'un
// lien externe collé à la main) — ou l'efface pour revenir à l'animation par défaut.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { videoUrl, remove } = await req.json();

  if (remove) {
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: { heroVideoUrl: null },
      create: { id: "singleton", heroVideoUrl: null },
    });
    return NextResponse.json({ success: true });
  }

  if (!videoUrl || typeof videoUrl !== "string" || !videoUrl.trim()) {
    return NextResponse.json({ error: "Lien manquant" }, { status: 400 });
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { heroVideoUrl: videoUrl.trim() },
    create: { id: "singleton", heroVideoUrl: videoUrl.trim() },
  });

  return NextResponse.json({ success: true });
}