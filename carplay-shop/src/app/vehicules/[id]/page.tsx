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

const FILES_FEATURES = ["Fichier d'activation propre à votre véhicule", "Guide PDF pas à pas", "Envoi automatique par email", "Support par email"];
const PHYSICAL_FEATURES = ["Carte mémoire préparée par nos soins", "Envoi via Mondial Relais à votre adresse", "Guide PDF envoyé par email", "Aucune manipulation de fichiers"];

export default async function VehicleDetailPage({ params }: { params: { id: string } }) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { position: "asc" } } },
  });
  if (!vehicle || !vehicle.active) notFound();

  return (
    <>
      <Header />
      <section className="container page-section">
        <p className="mb-16">
          <Link href="/vehicules" className="back-link">← Toutes les annonces</Link>
        </p>

        <div className="hero-grid mb-48">
          <div>
            <p className="eyebrow">Annonce</p>
            <h1 className="detail-title">{vehicle.title}</h1>
            {vehicle.description && (
              <div className="rich-content" dangerouslySetInnerHTML={{ __html: vehicle.description }} />
            )}
            <a href="#formules" className="btn btn-primary mt-20">
              Commander
            </a>
          </div>

          <div className="card hero-media">
            <VehicleGallery imageIds={vehicle.images.map((img) => img.id)} title={vehicle.title} />
          </div>
        </div>

        <p className="eyebrow" id="formules">Deux formules</p>
        <h2 className="section-heading-sm">Choisissez votre formule</h2>

        <div className="two-col-grid">
          {/* Formule 1 */}
          <div className="card formula-card formula-files">
            <div className="formula-body">
              <p className="eyebrow muted">Formule 1</p>
              <h3 className="formula-title">Fichiers seuls</h3>
              <p className="formula-desc">
                Vous recevez par email le fichier d'activation et son guide PDF. Vous préparez
                vous-même votre carte mémoire.
              </p>
              <ul className="feature-list">
                {FILES_FEATURES.map((f) => (
                  <li key={f} className="feature-item">
                    <span className="feature-check">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="formula-price">
                {eur(vehicle.priceFilesCents)}
              </p>
              <Link href={`/checkout?vehicule=${vehicle.id}&formule=fichiers`} className="btn btn-primary btn-block">
                Choisir cette formule
              </Link>
            </div>
          </div>

          {/* Formule 2 */}
          <div className="card formula-card formula-physical">
            <span className="badge badge-shipped formula-badge">Le plus choisi</span>
            <div className="formula-body">
              <p className="eyebrow">Formule 2</p>
              <h3 className="formula-title">Carte mémoire prête à l'emploi</h3>
              <p className="formula-desc">
                On prépare pour vous une carte mémoire avec le fichier déjà installé, avec le guide
                PDF final.
              </p>
              <div className="shipping-note">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 8L12 3L21 8V16L12 21L3 16V8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M3 8L12 13L21 8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M12 13V21" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                Expédition via Mondial Relais
              </div>
              <ul className="feature-list">
                {PHYSICAL_FEATURES.map((f) => (
                  <li key={f} className="feature-item">
                    <span className="feature-check">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="formula-price">
                {eur(vehicle.pricePhysicalCents)}
              </p>
              <Link href={`/checkout?vehicule=${vehicle.id}&formule=carte`} className="btn btn-amber btn-block">
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
