import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { isSafeHttpUrl } from "@/lib/html";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const contactEmail = typeof body?.contactEmail === "string" ? body.contactEmail.trim() : "";
  const instagramUrl = typeof body?.instagramUrl === "string" ? body.instagramUrl.trim() : "";
  const whatsappRaw = typeof body?.whatsappUrl === "string" ? body.whatsappUrl.trim() : "";

  if (!contactEmail || contactEmail.length > 254 || !EMAIL_RE.test(contactEmail)) {
    return NextResponse.json({ error: "Email de contact invalide" }, { status: 400 });
  }
  // Ces liens sont affichés en href sur le site et dans les emails : uniquement http(s).
  if (!isSafeHttpUrl(instagramUrl)) {
    return NextResponse.json({ error: "Le lien Instagram doit être une URL complète (https://...)" }, { status: 400 });
  }
  if (whatsappRaw && !isSafeHttpUrl(whatsappRaw)) {
    return NextResponse.json({ error: "Le lien WhatsApp doit être une URL complète (https://wa.me/...)" }, { status: 400 });
  }
  const whatsappUrl = whatsappRaw || null;

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { contactEmail, instagramUrl, whatsappUrl },
    create: { id: "singleton", contactEmail, instagramUrl, whatsappUrl },
  });

  return NextResponse.json({ success: true });
}
