import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Les champs secrets ne sont mis à jour QUE si une nouvelle valeur non vide est
// envoyée (un champ laissé vide dans le formulaire = "je ne change pas ce secret").
// La valeur en clair n'est jamais renvoyée au navigateur ailleurs que juste après
// la saisie par l'admin lui-même.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const data: any = {};

  // Champs secrets : uniquement si renseignés
  const secretFields = ["stripeSecretKey", "stripeWebhookSecret", "paypalClientSecret", "resendApiKey"];
  for (const field of secretFields) {
    if (typeof body[field] === "string" && body[field].trim() !== "") {
      data[field] = body[field].trim();
    }
  }

  // Champs non secrets : toujours mis à jour s'ils sont présents dans la requête
  const plainFields = [
    "paypalClientId",
    "paypalEnv",
    "emailFrom",
    "adminNotificationEmail",
    "companyName",
    "companyAddress",
  ];
  for (const field of plainFields) {
    if (typeof body[field] === "string") {
      data[field] = body[field].trim();
    }
  }

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  return NextResponse.json({ success: true });
}