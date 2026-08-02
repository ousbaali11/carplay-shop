import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@tondomaine.fr";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMoi123!";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: "Admin",
        lastName: "Boutique",
        role: "ADMIN",
      },
    });
    console.log(`✅ Compte admin créé : ${adminEmail} / ${adminPassword}`);
    console.log("⚠️  Change ce mot de passe dès ta première connexion sur /admin/connexion");
  } else {
    console.log("ℹ️  Un compte admin existe déjà avec cet email, rien créé.");
  }

  // Quelques véhicules de démonstration pour pouvoir tester le site tout de suite.
  // Sans PDF ni fichier d'activation réels : à uploader ensuite depuis /admin/vehicules.
  const demoVehicles = [
    { title: "Kit CarPlay — Volkswagen Golf 7", priceFilesCents: 2990, pricePhysicalCents: 4990 },
    { title: "Kit CarPlay — Peugeot 3008", priceFilesCents: 3490, pricePhysicalCents: 5490 },
    { title: "Kit CarPlay — Renault Clio 5", priceFilesCents: 2790, pricePhysicalCents: 4790 },
  ];

  for (const veh of demoVehicles) {
    const existing = await prisma.vehicle.findFirst({ where: { title: veh.title } });
    if (!existing) {
      await prisma.vehicle.create({ data: veh });
      console.log(`✅ Véhicule de démo créé : ${veh.title}`);
    }
  }

  console.log("\n⚠️  Ces véhicules de démo n'ont pas encore de PDF ni de fichier d'activation.");
  console.log("   Ajoute-les depuis /admin/vehicules pour pouvoir tester un vrai téléchargement,");
  console.log("   ou supprime ces exemples et crée tes propres véhicules.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
