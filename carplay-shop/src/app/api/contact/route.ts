import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactFormEmail } from "@/lib/email";
import { rateLimit, getClientIp, tooManyRequests, MINUTE } from "@/lib/rate-limit";

const schema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().default(""),
  subject: z.string().trim().min(1).max(150),
  message: z.string().trim().min(1).max(5000),
  // Champ "pot de miel" : jamais affiché dans le formulaire, donc toujours vide
  // pour un humain. Un robot qui le remplit obtient un faux succès.
  website: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  // Anti-spam : au plus 5 messages par quart d'heure et par adresse IP.
  const ip = getClientIp(req.headers);
  const limit = rateLimit(`contact:ip:${ip}`, 5, 15 * MINUTE);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSec, "Trop de messages envoyés. Réessaie dans quelques minutes.");

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Champs manquants ou invalides" }, { status: 400 });
  }
  const { website, ...data } = parsed.data;
  if (website) return NextResponse.json({ success: true });

  try {
    const sent = await sendContactFormEmail(data);
    if (!sent) {
      return NextResponse.json({ error: "Le service d'email n'est pas configuré pour le moment." }, { status: 500 });
    }
  } catch (err) {
    console.error("Erreur envoi formulaire de contact:", err);
    return NextResponse.json({ error: "Échec de l'envoi du message, réessaie dans un instant." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
