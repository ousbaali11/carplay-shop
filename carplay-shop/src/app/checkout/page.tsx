import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/orders";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { vehicule?: string; formule?: string };
}) {
  const vehicleId = searchParams.vehicule;
  const formula = searchParams.formule === "carte" ? "PHYSICAL_CARD" : searchParams.formule === "fichiers" ? "FILES_ONLY" : null;
  if (!vehicleId || !formula) notFound();

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle || !vehicle.active) notFound();

  const settings = await getSettings();
  const priceCents = formula === "PHYSICAL_CARD" ? vehicle.pricePhysicalCents : vehicle.priceFilesCents;

  return (
    <>
      <Header />
      <section className="container" style={{ padding: "50px 0" }}>
        <h1 style={{ fontSize: 28, marginBottom: 28 }}>Finaliser ma commande</h1>
        <CheckoutClient
          vehicle={{
            id: vehicle.id,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
          }}
          formula={formula}
          priceCents={priceCents}
          stripeEnabled={settings.stripeEnabled}
          paypalEnabled={settings.paypalEnabled}
        />
      </section>
      <Footer />
    </>
  );
}
