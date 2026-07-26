/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // pdfkit lit ses fichiers de police directement sur le disque : on l'exclut
  // du bundling webpack pour que ça continue de fonctionner côté serveur.
  experimental: {
    serverComponentsExternalPackages: ["pdfkit"],
  },
};

module.exports = nextConfig;