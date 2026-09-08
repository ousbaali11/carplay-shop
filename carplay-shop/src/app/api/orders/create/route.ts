import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/tokens";
import { requireUser } from "@/lib/admin";

const schema = z.object({
  vehicleId: z.string().min(1).max(64),
  formula: z.enum(["FILES_ONLY", "PHYSICAL_CARD"]),
  email: z.string().trim().email().max(254),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(6).max(40),
  radioSoftwareVersion: z.string().trim().min(1).max(120),
  vehicleYear: z.string().trim().min(1).max(20),
  address: z.string().trim().max(200).optional(),
  addressComp: z.string().trim().max(200).optional(),
  postalCode: z.string().trim().max(20).optional(),
  city: z.string().trim().max(100).optional(),
  country: z.string().trim().max(80).optional(),
});

// Crée la commande en base AVANT le paiement (statut PENDING_PAYMENT).
// Le statut ne passera à PAID/PREPARING qu'après confirmation serveur du paiement.
// Le prix est TOUJOURS relu depuis la fiche véhicule en base, jamais depuis le client.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const isPhysical = data.formula === "PHYSICAL_CARD";

  if (isPhysical && (!data.address || !data.postalCode || !data.city || !data.country)) {
    return NextResponse.json({ error: "Adresse postale requise pour la formule carte physique" }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle || !vehicle.active) {
    return NextResponse.json({ error: "Véhicule indisponible" }, { status: 404 });
  }

  const priceCents = isPhysical ? vehicle.pricePhysicalCents : vehicle.priceFilesCents;
  if (priceCents <= 0) {
    return NextResponse.json({ error: "Cette formule n'est pas disponible pour ce véhicule." }, { status: 400 });
  }

  // Commande liée à un compte utilisateur si le client est connecté, sinon commande "invité".
  const user = await requireUser();
  const userId = user?.id || null;

  const orderData = {
    vehicleId: vehicle.id,
    vehicleTitle: vehicle.title,
    vehicleYear: data.vehicleYear,
    formula: data.formula,
    priceCents,
    userId,
    email: data.email.toLowerCase(),
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    radioSoftwareVersion: data.radioSoftwareVersion,
    address: isPhysical ? data.address : null,
    addressComp: isPhysical ? data.addressComp || null : null,
    postalCode: isPhysical ? data.postalCode : null,
    city: isPhysical ? data.city : null,
    country: (isPhysical && data.country) || "France",
  };

  // Le numéro de commande est aléatoire (6 chiffres) : en cas de collision
  // (contrainte unique), on retire un autre numéro au lieu de renvoyer une erreur.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const order = await prisma.order.create({ data: { ...orderData, orderNumber: generateOrderNumber() } });
      return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber, priceCents: order.priceCents });
    } catch (err: any) {
      if (err?.code === "P2002" && attempt < 4) continue;
      console.error("Erreur création commande:", err);
      return NextResponse.json({ error: "Impossible de créer la commande, réessaie dans un instant." }, { status: 500 });
    }
  }
  return NextResponse.json({ error: "Impossible de créer la commande, réessaie dans un instant." }, { status: 500 });
}
