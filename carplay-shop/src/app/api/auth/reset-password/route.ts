import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = body?.token;
  const newPassword = body?.newPassword;
  if (typeof token !== "string" || !token || token.length > 128 || typeof newPassword !== "string" || !newPassword) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit faire au moins 8 caractères" }, { status: 400 });
  }
  if (newPassword.length > 200) {
    return NextResponse.json({ error: "Mot de passe trop long" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { resetToken: token } });
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return NextResponse.json({ error: "Lien invalide ou expiré. Refais une demande." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  // Le token est consommé de façon atomique : si deux requêtes arrivent avec le
  // même lien, une seule change le mot de passe.
  const result = await prisma.user.updateMany({
    where: { id: user.id, resetToken: token },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Lien invalide ou expiré. Refais une demande." }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
