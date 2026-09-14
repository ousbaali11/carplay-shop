import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

// Vérifie que l'appelant est un administrateur connecté. Renvoie la session
// (avec id/role) ou null. À utiliser dans TOUTES les routes /api/admin/*.
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user.role !== "ADMIN") return null;
  return { id: user.id, email: session?.user?.email || null };
}

// Variante pour les PAGES /admin/* (composants serveur) : redirige vers la
// connexion admin si l'appelant n'est pas administrateur. Le middleware fait
// déjà ce contrôle ; celui-ci est une deuxième barrière au cas où une page
// serait un jour servie sans passer par le middleware.
export async function requireAdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/connexion");
  return admin;
}

// Vérifie qu'un utilisateur (client ou admin) est connecté.
export async function requireUser() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return null;
  return { id: user.id, role: user.role, email: session?.user?.email || null };
}
