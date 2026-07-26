import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Photo publique d'un véhicule (aperçu, ce n'est pas un contenu payant).
export async function GET(req: Request, { params }: { params: { imageId: string } }) {
  const image = await prisma.vehicleImage.findUnique({ where: { id: params.imageId } });
  if (!image) {
    return NextResponse.json({ error: "Image introuvable" }, { status: 404 });
  }
  return new NextResponse(image.data as any, {
    headers: {
      "Content-Type": image.mimeType || "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
