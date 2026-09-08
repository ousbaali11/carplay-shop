import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Photo publique d'un véhicule (aperçu, ce n'est pas un contenu payant).
export async function GET(req: Request, { params }: { params: { imageId: string } }) {
  const image = await prisma.vehicleImage.findUnique({ where: { id: params.imageId } });
  // Seuls des types image sont servis : jamais de HTML/SVG interprétable par le navigateur.
  if (!image || !image.mimeType.startsWith("image/") || image.mimeType === "image/svg+xml") {
    return NextResponse.json({ error: "Image introuvable" }, { status: 404 });
  }
  return new NextResponse(image.data as any, {
    headers: {
      "Content-Type": image.mimeType,
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
