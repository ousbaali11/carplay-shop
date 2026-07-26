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
    { brand: "Volkswagen", model: "Golf 7", year: "2017-2020", priceFilesCents: 2990, pricePhysicalCents: 4990 },
    { brand: "Peugeot", model: "3008", year: "2019-2022", priceFilesCents: 3490, pricePhysicalCents: 5490 },
    { brand: "Renault", model: "Clio 5", year: "2020-2023", priceFilesCents: 2790, pricePhysicalCents: 4790 },
  ];

  for (const veh of demoVehicles) {
    const existing = await prisma.vehicle.findFirst({ where: { brand: veh.brand, model: veh.model, year: veh.year } });
    if (!existing) {
      await prisma.vehicle.create({ data: veh });
      console.log(`✅ Véhicule de démo créé : ${veh.brand} ${veh.model} (${veh.year})`);
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
