import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Toute la logique d'autorisation est gérée ici, dans la fonction middleware
// elle-même (le callback "authorized" ci-dessous laisse toujours passer).
// C'est volontaire : cela évite que next-auth redirige de son côté vers la
// mauvaise page de connexion (ex: renvoyer un admin non connecté vers la
// page de connexion CLIENT au lieu de la page de connexion ADMIN).
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;
    const path = req.nextUrl.pathname;

    const isAdminConnexion = path === "/admin/connexion";
    const isAdminArea = path.startsWith("/admin");
    const isCompteConnexion = path === "/compte/connexion" || path === "/compte/inscription";
    const isCompteArea = path.startsWith("/compte");

    // Zone admin (sauf la page de connexion admin elle-même)
    if (isAdminArea && !isAdminConnexion && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/connexion", req.url));
    }
    // Un admin déjà connecté qui retombe sur la page de connexion admin
    // est renvoyé directement vers le tableau de bord.
    if (isAdminConnexion && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // Zone client (sauf connexion/inscription)
    if (isCompteArea && !isCompteConnexion && !token) {
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
  matcher: ["/admin/:path*", "/compte/:path*"],
};