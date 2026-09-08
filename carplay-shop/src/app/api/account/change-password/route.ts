import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireUser } from "@/lib/admin";

// Utilisée à la fois par l'espace client (/compte) et l'espace admin (/admin) :
// n'importe quel utilisateur connecté peut changer SON PROPRE mot de passe, en
// confirmant son mot de passe actuel.
export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const currentPassword = body?.currentPassword;
  const newPassword = body?.newPassword;
  if (typeof currentPassword !== "string" || !currentPassword || typeof newPassword !== "string" || !newPassword) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Le nouveau mot de passe doit faire au moins 8 caractères" }, { status: 400 });
  }
  if (newPassword.length > 200) {
    return NextResponse.json({ error: "Mot de passe trop long" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 403 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: dbUser.id }, data: { passwordHash } });

  return NextResponse.json({ success: true });
}
