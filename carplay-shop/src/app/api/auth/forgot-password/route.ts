import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResetToken, resetTokenExpiryDate } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getClientIp, tooManyRequests, MINUTE, HOUR } from "@/lib/rate-limit";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Ne révèle jamais si un email existe ou non en base (protection contre
// l'énumération de comptes) : la réponse est toujours la même, y compris si
// l'envoi d'email échoue (sinon une erreur 500 uniquement pour les emails
// existants trahirait leur existence).
export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  const ipLimit = rateLimit(`forgot:ip:${ip}`, 5, 15 * MINUTE);
  if (!ipLimit.ok) return tooManyRequests(ipLimit.retryAfterSec);

  const body = await req.json().catch(() => null);
  const email = body?.email;
  if (typeof email !== "string" || !email.trim() || email.length > 254 || !email.includes("@")) {
    return NextResponse.json({ error: "Email manquant ou invalide" }, { status: 400 });
  }
  const normalizedEmail = email.toLowerCase().trim();

  // Au plus 3 emails de réinitialisation par heure pour une même adresse
  // (anti-spam de la boîte du destinataire). Réponse identique dans tous les
  // cas, pour ne pas révéler l'existence du compte.
  if (!rateLimit(`forgot:email:${normalizedEmail}`, 3, HOUR).ok) {
    return NextResponse.json({ success: true });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (user) {
      const token = generateResetToken();
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiry: resetTokenExpiryDate() },
      });

      await sendPasswordResetEmail({
        email: user.email,
        firstName: user.firstName,
        resetUrl: `${SITE_URL}/compte/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`,
      });
    }
  } catch (err) {
    console.error("Erreur demande de réinitialisation de mot de passe:", err);
  }

  return NextResponse.json({ success: true });
}
