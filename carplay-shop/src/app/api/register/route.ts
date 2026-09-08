import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().trim().email("Email invalide").max(254),
  password: z.string().min(8, "8 caractères minimum").max(200, "Mot de passe trop long"),
  firstName: z.string().trim().min(1, "Prénom obligatoire").max(80),
  lastName: z.string().trim().min(1, "Nom obligatoire").max(80),
  phone: z.string().trim().max(40).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Formulaire invalide" }, { status: 400 });
  }
  const { email, password, firstName, lastName, phone } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        // Le rôle est TOUJOURS CLIENT à l'inscription publique : un admin ne se
        // crée que via `npm run admin:set` (jamais depuis le site).
        role: "CLIENT",
      },
    });
  } catch (err: any) {
    // Deux inscriptions simultanées avec le même email : la contrainte unique tranche.
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ success: true });
}
