import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { invoicesEnabled } = await req.json();

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { invoicesEnabled: !!invoicesEnabled },
    create: { id: "singleton", invoicesEnabled: !!invoicesEnabled },
  });

  return NextResponse.json({ success: true });
}
