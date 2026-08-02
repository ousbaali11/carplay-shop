import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VehicleGallery from "@/components/VehicleGallery";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function eur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default async function VehicleDetailPage({ params }: { params: { id: string } }) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { position: "asc" } } },
  });
  if (!vehicle || !vehicle.active) notFound();

  return (
    <>
      <Header />
      <section className="container" style={{ padding: "50px 0" }}>
        <p style={{ marginBottom: 16 }}>
          <Link href="/vehicules" style={{ color: "var(--cyan)", fontSize: 13 }}>← Toutes les annonces</Link>
        </p>

        <div className="hero-grid" style={{ marginBottom: 48 }}>
          <div>
            <p className="eyebrow">Annonce</p>
            <h1 style={{ fontSize: 32, margin: "10px 0 16px" }}>{vehicle.title}</h1>
            {vehicle.description && (
              <div className="rich-content" dangerouslySetInnerHTML={{ __html: vehicle.description }} />
            )}
            <a href="#formules" className="btn btn-primary" style={{ marginTop: 20 }}>
              Commander
            </a>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <VehicleGallery imageIds={vehicle.images.map((img) => img.id)} title={vehicle.title} />
          </div>
        </div>

        <p className="eyebrow" id="formules">Deux formules</p>
        <h2 style={{ fontSize: 28, margin: "10px 0 32px" }}>Choisissez votre formule</h2>

        <div className="two-col-grid">
          {/* Formule 1 */}
          <div className="card" style={{ borderColor: "var(--amber)", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1 }}>
              <p className="eyebrow" style={{ color: "var(--text-muted)" }}>Formule 1</p>
              <h3 style={{ fontSize: 24, margin: "10px 0" }}>Fichiers seuls</h3>
              <p style={{ margin: "8px 0 20px" }}>
                Vous recevez par email le fichier d'activation et son guide PDF. Vous préparez
                vous-même votre carte mémoire.
              </p>
              <ul style={{ margin: "0 0 24px", padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                {["Fichier d'activation propre à votre véhicule", "Guide PDF pas à pas", "Envoi automatique par email", "Support par email"].map((f) => (
                  <li key={f} style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--text-muted)" }}>
                    <span style={{ color: "var(--success)" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p style={{ fontSize: 26, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 16 }}>
                {eur(vehicle.priceFilesCents)}
              </p>
              <Link href={`/checkout?vehicule=${vehicle.id}&formule=fichiers`} className="btn btn-primary" style={{ width: "100%" }}>
                Choisir cette formule
              </Link>
            </div>
          </div>

          {/* Formule 2 */}
          <div className="card" style={{ borderColor: "var(--cyan)", position: "relative", display: "flex", flexDirection: "column" }}>
            <span className="badge badge-shipped" style={{ position: "absolute", top: 28, right: 28 }}>Le plus choisi</span>
            <div style={{ flex: 1 }}>
              <p className="eyebrow">Formule 2</p>
              <h3 style={{ fontSize: 24, margin: "10px 0" }}>Carte mémoire prête à l'emploi</h3>
              <p style={{ margin: "8px 0 20px" }}>
                On prépare pour vous une carte mémoire avec le fichier déjà installé, avec le guide
                PDF final.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 20px", fontSize: 13, color: "var(--text-muted)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 8L12 3L21 8V16L12 21L3 16V8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M3 8L12 13L21 8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M12 13V21" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                Expédition via Mondial Relais
              </div>
              <ul style={{ margin: "0 0 24px", padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                {["Carte mémoire préparée par nos soins", "Envoi via Mondial Relais à votre adresse", "Guide PDF envoyé par email", "Aucune manipulation de fichiers"].map((f) => (
                  <li key={f} style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--text-muted)" }}>
                    <span style={{ color: "var(--success)" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p style={{ fontSize: 26, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 16 }}>
                {eur(vehicle.pricePhysicalCents)}
              </p>
              <Link href={`/checkout?vehicule=${vehicle.id}&formule=carte`} className="btn btn-amber" style={{ width: "100%" }}>
                Choisir cette formule
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
