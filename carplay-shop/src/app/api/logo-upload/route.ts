import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

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
          allowedContentTypes: ["image/png", "image/jpeg", "image/svg+xml", "image/webp"],
          maximumSizeInBytes: 5 * 1024 * 1024, // 5 Mo
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Échec de l'upload" }, { status: 400 });
  }
}
