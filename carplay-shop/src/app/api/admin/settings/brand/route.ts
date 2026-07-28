import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { siteName, logoUrl, removeLogo } = await req.json();

  const data: any = {};
  if (typeof siteName === "string" && siteName.trim()) data.siteName = siteName.trim();
  if (removeLogo) data.logoUrl = null;
  else if (typeof logoUrl === "string" && logoUrl.trim()) data.logoUrl = logoUrl.trim();

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  return NextResponse.json({ success: true });
}