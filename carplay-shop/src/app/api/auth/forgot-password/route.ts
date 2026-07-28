import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResetToken, resetTokenExpiryDate } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Ne révèle jamais si un email existe ou non en base (protection contre
// l'énumération de comptes) : la réponse est toujours la même.
export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email manquant" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  if (user) {
    const token = generateResetToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: resetTokenExpiryDate() },
    });

    await sendPasswordResetEmail({
      email: user.email,
      firstName: user.firstName,
      resetUrl: `${SITE_URL}/compte/reinitialiser-mot-de-passe?token=${token}`,
    });
  }

  return NextResponse.json({ success: true });
}
