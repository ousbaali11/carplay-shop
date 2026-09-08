import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { isSafeHttpUrl } from "@/lib/html";

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const { siteName, logoUrl, logoHeight, removeLogo } = body ?? {};

  const data: { siteName?: string; logoUrl?: string | null; logoHeight?: number } = {};
  if (typeof siteName === "string" && siteName.trim()) {
    if (siteName.trim().length > 60) {
      return NextResponse.json({ error: "Le nom du site est trop long (60 caractères max)" }, { status: 400 });
    }
    data.siteName = siteName.trim();
  }
  if (removeLogo) {
    data.logoUrl = null;
  } else if (typeof logoUrl === "string" && logoUrl.trim()) {
    // Affiché dans <img src=...> : uniquement http(s).
    if (!isSafeHttpUrl(logoUrl)) {
      return NextResponse.json({ error: "Lien du logo invalide" }, { status: 400 });
    }
    data.logoUrl = logoUrl.trim();
  }
  if (typeof logoHeight === "number" && Number.isFinite(logoHeight) && logoHeight >= 20 && logoHeight <= 120) {
    data.logoHeight = Math.round(logoHeight);
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  return NextResponse.json({ success: true });
}
