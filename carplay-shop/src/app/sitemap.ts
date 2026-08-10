import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Génère automatiquement /sitemap.xml — la liste des pages que Google doit
// explorer, avec tes annonces actives ajoutées dynamiquement.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://carplayactiv.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/vehicules`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/cgv`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const vehicles = await prisma.vehicle.findMany({
    where: { active: true },
    select: { id: true, updatedAt: true },
  });

  const vehiclePages: MetadataRoute.Sitemap = vehicles.map((v) => ({
    url: `${siteUrl}/vehicules/${v.id}`,
    lastModified: v.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...vehiclePages];
}