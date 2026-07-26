import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Usage : npm run admin:set -- ton-email@exemple.fr TonMotDePasse123!
// Crée le compte s'il n'existe pas, ou met à jour son mot de passe et son rôle
// (ADMIN) s'il existe déjà. Utile pour définir ton propre mot de passe, ou pour
// réinitialiser un compte admin dont tu as perdu le mot de passe.
async function main() {
  const [, , email, password, firstName = "Admin", lastName = "Boutique"] = process.argv;

  if (!email || !password) {
    console.error("Usage : npm run admin:set -- ton-email@exemple.fr TonMotDePasse123!");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Le mot de passe doit faire au moins 8 caractères.");
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email: normalizedEmail,
      passwordHash,
      firstName,
      lastName,
      role: "ADMIN",
    },
  });

  console.log(`✅ Compte admin prêt : ${user.email}`);
  console.log("   Connecte-toi sur /admin/connexion avec ce mot de passe.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
