import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Sert la vidéo hero uploadée directement (option B). Publique : ce n'est pas
// un contenu payant, juste la vidéo de présentation de la page d'accueil.
export async function GET() {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  if (!settings?.heroVideoData) {
    return NextResponse.json({ error: "Aucune vidéo configurée" }, { status: 404 });
  }
  return new NextResponse(settings.heroVideoData as any, {
    headers: {
      "Content-Type": settings.heroVideoMimeType || "video/mp4",
      "Cache-Control": "public, max-age=3600",
    },
  });
}