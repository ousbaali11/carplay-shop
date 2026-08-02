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
      <section style={{ padding: "80px 0 60px", borderBottom: "1px solid var(--line)" }}>
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Activation CarPlay & Android Auto</p>
            <h1 style={{ fontSize: 46, lineHeight: 1.08, margin: "16px 0" }}>
              Débloquez CarPlay sur votre écran d'origine, sans changer d'autoradio.
            </h1>
            <p style={{ fontSize: 17, maxWidth: 460 }}>
              Chaque véhicule a sa propre annonce. Trouvez la vôtre, puis choisissez la formule qui
              vous convient.
            </p>
            <div style={{ display: "flex", gap: 14, marginTop: 28 }}>
              <a href="#annonces" className="btn btn-primary">Voir les annonces</a>
              <a href="#comment-ca-marche" className="btn btn-secondary">Comment ça marche</a>
            </div>
            {vehicleCount > 0 && (
              <p style={{ marginTop: 20, fontSize: 13 }} className="mono">
                {vehicleCount} annonce{vehicleCount > 1 ? "s" : ""} disponible{vehicleCount > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Vidéo si configurée par l'admin, sinon animation par défaut */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {heroVideoSrc ? (
              <video
                src={heroVideoSrc}
                autoPlay
                muted
                loop
                playsInline
                style={{ display: "block", width: "100%", aspectRatio: "480 / 300", objectFit: "cover" }}
              />
            ) : (
              <svg viewBox="0 0 480 300" width="100%" style={{ display: "block" }}>
                <rect width="480" height="300" fill="#06080a" />
                <rect x="20" y="20" width="440" height="230" rx="14" fill="#0c1013" stroke="#242a31" strokeWidth="2" />
                <rect x="36" y="36" width="408" height="198" rx="6" fill="#0a0d10" />
                <circle cx="240" cy="135" r="46" fill="none" stroke="#00c2ce" strokeWidth="2.5" opacity="0.9" />
                <path d="M240 100 L258 128 L222 128 Z" fill="#00c2ce" />
                <rect x="222" y="130" width="36" height="26" rx="4" fill="#00c2ce" />
                <text x="240" y="200" fill="#8891a0" fontFamily="IBM Plex Mono" fontSize="11" textAnchor="middle" letterSpacing="2">
                  CARPLAY ACTIVÉ
                </text>
                <rect x="50" y="264" width="380" height="6" rx="3" fill="#1c2027" />
                <rect x="50" y="264" width="260" height="6" rx="3" fill="#00c2ce" />
                <circle cx="440" cy="50" r="4" fill="#3ddc84" />
              </svg>
            )}
          </div>
        </div>
      </section>

      {/* ANNONCES */}
      <section id="annonces" style={{ padding: "72px 0" }}>
        <div className="container">
          <p className="eyebrow">Nos annonces</p>
          <h2 style={{ fontSize: 32, margin: "10px 0 40px" }}>Trouvez votre véhicule</h2>

          {vehicles.length === 0 ? (
            <p>Aucune annonce disponible pour le moment. Revenez bientôt ou contactez-nous.</p>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18, marginBottom: 32 }}>
                {vehicles.map((v) => (
                  <div key={v.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <Link href={`/vehicules/${v.id}`} style={{ display: "block" }}>
                      <div style={{ aspectRatio: "16/10", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {v.imageId ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/api/vehicules/image/${v.imageId}`} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Pas de photo</span>
                        )}
                      </div>
                    </Link>
                    <div style={{ padding: 16 }}>
                      <Link href={`/vehicules/${v.id}`} style={{ textDecoration: "none" }}>
                        <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{v.title}</p>
                      </Link>
                      {v.description && (
                        <div className="rich-content" style={{ fontSize: 13, marginBottom: 10 }} dangerouslySetInnerHTML={{ __html: v.description }} />
                      )}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <p style={{ color: "var(--cyan)", fontWeight: 700, fontFamily: "var(--font-display)" }}>Prix : {eur(v.priceFromCents)}</p>
                        <Link href={`/vehicules/${v.id}`} className="btn btn-primary" style={{ fontSize: 13, padding: "8px 16px" }}>
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
      <section id="comment-ca-marche" style={{ padding: "72px 0", borderTop: "1px solid var(--line)" }}>
        <div className="container">
          <p className="eyebrow">Processus</p>
          <h2 style={{ fontSize: 32, margin: "10px 0 40px" }}>Comment ça marche</h2>
          <div className="four-col-grid">
            {[
              ["01", "Choisissez", "Trouvez l'annonce correspondant à votre véhicule, puis la formule qui vous convient."],
              ["02", "Payez", "Par carte bancaire ou PayPal, en toute sécurité."],
              ["03", "Recevez", "Vos fichiers arrivent par email. La carte physique part sous 48h."],
              ["04", "Activez", "Suivez le guide étape par étape pour activer CarPlay."],
            ].map(([n, t, d]) => (
              <div key={n}>
                <p className="mono" style={{ color: "var(--cyan)", fontSize: 13, marginBottom: 10 }}>{n}</p>
                <h4 style={{ fontSize: 17, marginBottom: 8 }}>{t}</h4>
                <p style={{ fontSize: 14 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: "72px 0", borderTop: "1px solid var(--line)" }}>
        <div className="container">
          <p className="eyebrow">Une question ?</p>
          <h2 style={{ fontSize: 32, margin: "10px 0 24px" }}>Contactez-nous</h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <a
              href={`mailto:${contactEmail}`}
              aria-label="Nous écrire par email"
              title={contactEmail}
              className="card"
              style={{ width: 56, height: 56, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
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
              className="card"
              style={{ width: 56, height: 56, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
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

          <div style={{ marginTop: 40, maxWidth: 480 }}>
            <p style={{ marginBottom: 16 }}>
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
