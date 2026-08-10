import { MetadataRoute } from "next";

// Génère automatiquement /robots.txt — dit à Google quelles pages explorer
// (le site public) et lesquelles ignorer (admin, comptes, paiement...).
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://carplayactiv.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/compte", "/checkout", "/api", "/telechargement"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}