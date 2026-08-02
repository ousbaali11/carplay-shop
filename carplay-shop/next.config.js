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
};

module.exports = nextConfig;
