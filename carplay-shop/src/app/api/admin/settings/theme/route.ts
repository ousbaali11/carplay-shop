import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidTheme } from "@/lib/themes";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { theme } = await req.json();
  if (typeof theme !== "string" || !isValidTheme(theme)) {
    return NextResponse.json({ error: "Thème invalide" }, { status: 400 });
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { theme },
    create: { id: "singleton", theme },
  });

  return NextResponse.json({ success: true });
}