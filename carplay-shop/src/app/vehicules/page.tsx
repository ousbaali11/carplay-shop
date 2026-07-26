import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import VehiclesList from "./VehiclesList";

export const dynamic = "force-dynamic";

export default async function VehiclesPage({ searchParams }: { searchParams: { formule?: string } }) {
  const formula = searchParams.formule === "carte" ? "PHYSICAL_CARD" : searchParams.formule === "fichiers" ? "FILES_ONLY" : null;
  if (!formula) redirect("/#produits");

  const vehicles = await prisma.vehicle.findMany({
    where: { active: true },
    orderBy: [{ brand: "asc" }, { model: "asc" }],
    include: { images: { orderBy: { position: "asc" } } },
  });

  const list = vehicles.map((v) => ({
    id: v.id,
    brand: v.brand,
    model: v.model,
    year: v.year,
    description: v.description,
    imageIds: v.images.map((img) => img.id),
    priceCents: formula === "PHYSICAL_CARD" ? v.pricePhysicalCents : v.priceFilesCents,
  }));

  return (
    <>
      <Header />
      <section className="container" style={{ padding: "50px 0" }}>
        <p className="eyebrow">{formula === "PHYSICAL_CARD" ? "Formule 2 — Carte mémoire" : "Formule 1 — Fichiers seuls"}</p>
        <h1 style={{ fontSize: 30, margin: "10px 0 8px" }}>Choisissez votre véhicule</h1>
        <p style={{ marginBottom: 32, maxWidth: 560 }}>
          Chaque véhicule a son propre fichier d'activation et son propre guide. Sélectionnez la
          marque, le modèle et l'année exacts de votre voiture pour recevoir les bons fichiers.
        </p>

        {list.length === 0 ? (
          <p>Aucun véhicule disponible pour le moment. Revenez bientôt ou contactez-nous.</p>
        ) : (
          <VehiclesList vehicles={list} formula={searchParams.formule === "carte" ? "carte" : "fichiers"} />
        )}
      </section>
      <Footer />
    </>
  );
}
