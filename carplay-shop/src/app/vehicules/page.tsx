import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import VehiclesList from "./VehiclesList";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    where: { active: true },
    orderBy: { title: "asc" },
    include: { images: { orderBy: { position: "asc" } } },
  });

  const list = vehicles.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    imageIds: v.images.map((img) => img.id),
    priceFromCents: Math.min(v.priceFilesCents, v.pricePhysicalCents),
  }));

  return (
    <>
      <Header />
      <section className="container" style={{ padding: "50px 0" }}>
        <p className="eyebrow">Nos annonces</p>
        <h1 style={{ fontSize: 30, margin: "10px 0 8px" }}>Choisissez votre véhicule</h1>
        <p style={{ marginBottom: 32, maxWidth: 560 }}>
          Sélectionnez l'annonce correspondant à votre véhicule : vous choisirez ensuite la formule
          (fichiers seuls ou carte physique) sur la page suivante.
        </p>

        {list.length === 0 ? (
          <p>Aucune annonce disponible pour le moment. Revenez bientôt ou contactez-nous.</p>
        ) : (
          <VehiclesList vehicles={list} />
        )}
      </section>
      <Footer />
    </>
  );
}
