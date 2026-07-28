import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Un seul des deux modes actif à la fois : si un lien externe est fourni, on
// l'utilise et on efface un éventuel fichier précédemment uploadé (et vice versa).
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const formData = await req.formData();
  const videoUrl = (formData.get("videoUrl") as string) || "";
  const remove = formData.get("remove") === "true";
  const file = formData.get("video") as File | null;

  if (remove) {
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: { heroVideoUrl: null, heroVideoData: null, heroVideoMimeType: null },
      create: { id: "singleton", heroVideoUrl: null },
    });
    return NextResponse.json({ success: true });
  }

  if (videoUrl.trim()) {
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: { heroVideoUrl: videoUrl.trim(), heroVideoData: null, heroVideoMimeType: null },
      create: { id: "singleton", heroVideoUrl: videoUrl.trim() },
    });
    return NextResponse.json({ success: true });
  }

  if (file && file.size > 0) {
    // Garde-fou : on refuse au-delà de 4 Mo, cohérent avec la limite pratique
    // de l'hébergement gratuit Vercel pour ce type de requête.
    if (file.size > 4.5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max ~4 Mo). Utilise plutôt un lien externe (option A)." },
        { status: 413 }
      );
    }
    const data = Buffer.from(await file.arrayBuffer());
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: { heroVideoData: data, heroVideoMimeType: file.type || "video/mp4", heroVideoUrl: null },
      create: { id: "singleton", heroVideoData: data, heroVideoMimeType: file.type || "video/mp4" },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Rien à enregistrer (aucun lien ni fichier fourni)" }, { status: 400 });
}