/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // pdfkit lit ses fichiers de police directement sur le disque : on l'exclut
  // du bundling webpack pour que ça continue de fonctionner côté serveur.
  experimental: {
    serverComponentsExternalPackages: ["pdfkit"],
    // Empêche Next.js de réafficher une page en cache après un changement d'état
    // de connexion (ex: revoir un compte connecté juste après une déconnexion).
    staleTimes: {
      dynamic: 0,
    },
  },
  // En-têtes de sécurité de base sur toutes les réponses : pas d'affichage du
  // site dans une iframe tierce (clickjacking), pas de "sniffing" du type de
  // contenu (un fichier uploadé ne peut pas être interprété comme du HTML),
  // referrer limité (les URLs /telechargement/<token> ne fuient pas vers des
  // sites tiers via l'en-tête Referer).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
