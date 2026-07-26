import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { contactEmail, instagramUrl } = await req.json();
  if (!contactEmail || !instagramUrl) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: { contactEmail, instagramUrl },
    create: { id: "singleton", contactEmail, instagramUrl },
  });

  return NextResponse.json({ success: true });
}