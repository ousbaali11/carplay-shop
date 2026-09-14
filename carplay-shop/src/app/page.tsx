import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/orders";

export const dynamic = "force-dynamic";

function eur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default async function HomePage() {
  const settings = await getSiteSettings();
  const contactEmail = settings.contactEmail;
  const instagramUrl = settings.instagramUrl;
  const heroVideoSrc = settings.heroVideoUrl || null;

  let vehicles: { id: string; title: string; description: string | null; imageId: string | null; priceFromCents: number }[] = [];
  let vehicleCount = 0;
  try {
    const all = await prisma.vehicle.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    });
    vehicleCount = await prisma.vehicle.count({ where: { active: true } });
    vehicles = all.map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      imageId: v.images[0]?.id || null,
      priceFromCents: Math.min(v.priceFilesCents, v.pricePhysicalCents),
    }));
  } catch {
    vehicleCount = 0;
  }

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Activation CarPlay & Android Auto</p>
            <h1 className="hero-title">
              Débloquez CarPlay sur votre écran d'origine, sans changer d'autoradio.
            </h1>
            <p className="hero-lead">
              Chaque véhicule a sa propre annonce. Trouvez la vôtre, puis choisissez la formule qui
              vous convient.
            </p>
            <div className="hero-actions">
              <a href="#annonces" className="btn btn-primary">Voir les annonces</a>
              <a href="#comment-ca-marche" className="btn btn-secondary">Comment ça marche</a>
            </div>
            {vehicleCount > 0 && (
              <p className="hero-count mono">
                {vehicleCount} annonce{vehicleCount > 1 ? "s" : ""} disponible{vehicleCount > 1 ? "s" : ""}
              </p>
            )}
            <ul className="hero-trust premium-only" aria-label="Garanties">
              <li>Paiement sécurisé Stripe ou PayPal</li>
              <li>Guide PDF pas à pas inclus</li>
              <li>Support par email</li>
            </ul>
          </div>

          {/* Vidéo si configurée par l'admin, sinon animation par défaut */}
          <div className="card hero-media">
            {heroVideoSrc ? (
              <video
                src={heroVideoSrc}
                autoPlay
                muted
                loop
                playsInline
                className="hero-video"
              />
            ) : (
              <svg viewBox="0 0 480 300" width="100%" className="hero-illustration">
                <rect className="hi-bg" width="480" height="300" fill="#06080a" />
                <rect className="hi-frame" x="20" y="20" width="440" height="230" rx="14" fill="#0c1013" stroke="#242a31" strokeWidth="2" />
                <rect className="hi-screen" x="36" y="36" width="408" height="198" rx="6" fill="#0a0d10" />
                <circle className="hi-accent-stroke" cx="240" cy="135" r="46" fill="none" stroke="#00c2ce" strokeWidth="2.5" opacity="0.9" />
                <path className="hi-accent" d="M240 100 L258 128 L222 128 Z" fill="#00c2ce" />
                <rect className="hi-accent" x="222" y="130" width="36" height="26" rx="4" fill="#00c2ce" />
                <text className="hi-text" x="240" y="200" fill="#8891a0" fontFamily="IBM Plex Mono" fontSize="11" textAnchor="middle" letterSpacing="2">
                  CARPLAY ACTIVÉ
                </text>
                <rect className="hi-track" x="50" y="264" width="380" height="6" rx="3" fill="#1c2027" />
                <rect className="hi-accent" x="50" y="264" width="260" height="6" rx="3" fill="#00c2ce" />
                <circle className="hi-dot" cx="440" cy="50" r="4" fill="#3ddc84" />
              </svg>
            )}
          </div>
        </div>
      </section>

      {/* ANNONCES */}
      <section id="annonces" className="section">
        <div className="container">
          <p className="eyebrow">Nos annonces</p>
          <h2 className="section-heading">Trouvez votre véhicule</h2>

          {vehicles.length === 0 ? (
            <p>Aucune annonce disponible pour le moment. Revenez bientôt ou contactez-nous.</p>
          ) : (
            <>
              <div className="vehicle-grid mb-32">
                {vehicles.map((v) => (
                  <div key={v.id} className="card vehicle-card card-hover">
                    <Link href={`/vehicules/${v.id}`} className="vehicle-card-media-link">
                      <div className="vehicle-card-media">
                        {v.imageId ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/api/vehicules/image/${v.imageId}`} alt={v.title} className="vehicle-card-img" />
                        ) : (
                          <span className="no-photo">Pas de photo</span>
                        )}
                      </div>
                    </Link>
                    <div className="vehicle-card-body">
                      <Link href={`/vehicules/${v.id}`} className="vehicle-card-title-link">
                        <p className="vehicle-card-title">{v.title}</p>
                      </Link>
                      {v.description && (
                        <div className="rich-content vehicle-card-desc" dangerouslySetInnerHTML={{ __html: v.description }} />
                      )}
                      <div className="vehicle-card-footer">
                        <p className="price-text">Prix : {eur(v.priceFromCents)}</p>
                        <Link href={`/vehicules/${v.id}`} className="btn btn-primary btn-compact">
                          Commander
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/vehicules" className="btn btn-secondary">Voir toutes les annonces</Link>
            </>
          )}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="comment-ca-marche" className="section bordered">
        <div className="container">
          <p className="eyebrow">Processus</p>
          <h2 className="section-heading">Comment ça marche</h2>
          <div className="four-col-grid">
            {[
              ["01", "Choisissez", "Trouvez l'annonce correspondant à votre véhicule, puis la formule qui vous convient."],
              ["02", "Payez", "Par carte bancaire ou PayPal, en toute sécurité."],
              ["03", "Recevez", "Vos fichiers arrivent par email. La carte physique part sous 48h."],
              ["04", "Activez", "Suivez le guide étape par étape pour activer CarPlay."],
            ].map(([n, t, d]) => (
              <div key={n} className="step">
                <p className="step-num mono">{n}</p>
                <h4 className="step-title">{t}</h4>
                <p className="step-desc">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section bordered">
        <div className="container">
          <p className="eyebrow">Une question ?</p>
          <h2 className="section-heading tight">Contactez-nous</h2>
          <div className="contact-icons">
            <a
              href={`mailto:${contactEmail}`}
              aria-label="Nous écrire par email"
              title={contactEmail}
              className="card icon-card"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="3" stroke="var(--cyan)" strokeWidth="2" />
                <path d="M3 6.5L12 13L21 6.5" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Notre Instagram"
              title="Instagram"
              className="card icon-card"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="ig-grad" x1="0" y1="24" x2="24" y2="0">
                    <stop offset="0" stopColor="#FFDC80" />
                    <stop offset="0.3" stopColor="#FCAF45" />
                    <stop offset="0.6" stopColor="#E1306C" />
                    <stop offset="1" stopColor="#833AB4" />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig-grad)" strokeWidth="2" />
                <circle cx="12" cy="12" r="4.5" stroke="url(#ig-grad)" strokeWidth="2" />
                <circle cx="17.2" cy="6.8" r="1.1" fill="url(#ig-grad)" />
              </svg>
            </a>
          </div>

          <div className="contact-form-wrap">
            <p className="mb-16">
              Contactez-nous directement via ce formulaire.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
