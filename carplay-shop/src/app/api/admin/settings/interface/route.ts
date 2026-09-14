import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { isValidInterfaceVersion } from "@/lib/ui";

// Bascule l'interface du site entre "standard" et "premium" (effet immédiat,
// toutes les pages lisent ce réglage dans le layout racine).
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const interfaceVersion = body?.interfaceVersion;
  if (!isValidInterfaceVersion(interfaceVersion)) {
    return NextResponse.json({ error: "Interface invalide" }, { status: 400 });
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { interfaceVersion },
    create: { id: "singleton", interfaceVersion },
  });

  return NextResponse.json({ success: true });
}
