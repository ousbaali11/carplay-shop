import { NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/email";

export async function POST(req: Request) {
  const { firstName, lastName, email, phone, subject, message } = await req.json();

  if (!firstName || !lastName || !email || !subject || !message) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const sent = await sendContactFormEmail({ firstName, lastName, email, phone: phone || "", subject, message });
  if (!sent) {
    return NextResponse.json({ error: "Le service d'email n'est pas configuré pour le moment." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
