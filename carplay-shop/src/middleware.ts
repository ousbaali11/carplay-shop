import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Bloque l'accès à /admin/* si l'utilisateur n'est pas connecté avec le rôle ADMIN.
// Bloque l'accès à /compte (espace client) si non connecté.
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;
    const path = req.nextUrl.pathname;

    const isAdminArea = path.startsWith("/admin") && path !== "/admin/connexion";

    if (isAdminArea && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/connexion", req.url));
    }
    // Un admin déjà connecté qui retombe sur la page de connexion est renvoyé
    // directement vers le tableau de bord, pour éviter d'y rester bloqué.
    if (path === "/admin/connexion" && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Les pages de connexion elles-mêmes restent publiques
        if (path === "/admin/connexion" || path === "/compte/connexion" || path === "/compte/inscription") {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/compte/:path*"],
};
