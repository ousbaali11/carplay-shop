import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Toute la logique d'autorisation est gérée ici, dans la fonction middleware
// elle-même (le callback "authorized" ci-dessous laisse toujours passer).
// C'est volontaire : cela évite que next-auth redirige de son côté vers la
// mauvaise page de connexion (ex: renvoyer un admin non connecté vers la
// page de connexion CLIENT au lieu de la page de connexion ADMIN).
//
// Les routes /api/admin/* vérifient CHACUNE le rôle admin côté serveur
// (src/lib/admin.ts) ; le contrôle ci-dessous est une deuxième barrière.
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as { role?: string } | null;
    const path = req.nextUrl.pathname;
    const isAdmin = token?.role === "ADMIN";

    // API admin : réponse JSON 403 (pas de redirection HTML vers une page de connexion).
    if (path.startsWith("/api/admin")) {
      if (!isAdmin) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      return NextResponse.next();
    }

    const isAdminConnexion = path === "/admin/connexion";
    const isAdminArea = path.startsWith("/admin");

    const publicComptePages = [
      "/compte/connexion",
      "/compte/inscription",
      "/compte/mot-de-passe-oublie",
      "/compte/reinitialiser-mot-de-passe",
    ];
    const isCompteConnexion = publicComptePages.includes(path);
    const isCompteArea = path.startsWith("/compte");

    // Zone admin (sauf la page de connexion admin elle-même)
    if (isAdminArea && !isAdminConnexion && !isAdmin) {
      return NextResponse.redirect(new URL("/admin/connexion", req.url));
    }
    // Un admin déjà connecté qui retombe sur la page de connexion admin
    // est renvoyé directement vers le tableau de bord.
    if (isAdminConnexion && isAdmin) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // Zone client (sauf connexion/inscription/mot de passe oublié) : un compte
    // ADMIN n'y est pas reconnu comme connecté (comptes admin et client
    // volontairement séparés), il doit se connecter avec un vrai compte client.
    if (isCompteArea && !isCompteConnexion && (!token || token.role !== "CLIENT")) {
      return NextResponse.redirect(new URL("/compte/connexion", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/compte/:path*", "/api/admin/:path*"],
};
