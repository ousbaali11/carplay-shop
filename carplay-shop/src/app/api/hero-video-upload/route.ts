import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

// Point d'entrée utilisé par le navigateur (via @vercel/blob/client côté
// composant admin) pour uploader la vidéo DIRECTEMENT vers Vercel Blob — le
// fichier ne transite jamais par nos propres fonctions serveur, ce qui évite
// la limite de 4,5 Mo des Vercel Functions.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "ADMIN") {
          throw new Error("Non autorisé");
        }
        return {
          allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime"],
          maximumSizeInBytes: 30 * 1024 * 1024, // 30 Mo
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Rien à faire ici : le composant admin enregistre lui-même l'URL
        // renvoyée dans Settings juste après l'upload (plus simple et fiable
        // que ce webhook, qui ne fonctionne pas en test local).
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Échec de l'upload" }, { status: 400 });
  }
}
