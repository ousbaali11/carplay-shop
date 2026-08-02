import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/tokens";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const schema = z.object({
  vehicleId: z.string(),
  formula: z.enum(["FILES_ONLY", "PHYSICAL_CARD"]),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(6),
  radioSoftwareVersion: z.string().min(1),
  vehicleYear: z.string().min(1),
  address: z.string().optional(),
  addressComp: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

// Crée la commande en base AVANT le paiement (statut PENDING_PAYMENT).
// Le statut ne passera à PAID/PREPARING qu'après confirmation serveur du paiement.
export async function POST(req: Request) {
  const body = await req.json();
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

  // Commande liée à un compte utilisateur si le client est connecté, sinon commande "invité".
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id || null;

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      vehicleId: vehicle.id,
      vehicleTitle: vehicle.title,
      vehicleYear: data.vehicleYear,
      formula: data.formula,
      priceCents,
      userId,
      email: data.email.toLowerCase().trim(),
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      radioSoftwareVersion: data.radioSoftwareVersion,
      address: data.address,
      addressComp: data.addressComp,
      postalCode: data.postalCode,
      city: data.city,
      country: data.country || "France",
    },
  });

  return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber, priceCents: order.priceCents });
}
