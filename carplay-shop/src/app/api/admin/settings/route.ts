import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { stripeEnabled, paypalEnabled } = await req.json();

  await prisma.paymentSettings.upsert({
    where: { id: "singleton" },
    update: { stripeEnabled: !!stripeEnabled, paypalEnabled: !!paypalEnabled },
    create: { id: "singleton", stripeEnabled: !!stripeEnabled, paypalEnabled: !!paypalEnabled },
  });

  return NextResponse.json({ success: true });
}
