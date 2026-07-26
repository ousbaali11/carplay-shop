import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();
  const contactEmail = settings.contactEmail;
  const instagramUrl = settings.instagramUrl;

  let vehicleCount = 0;
  try {
    vehicleCount = await prisma.vehicle.count({ where: { active: true } });
  } catch {
    vehicleCount = 0;
  }

  return (
    <>
      <Header />

      {/* HERO */}
      <section style={{ padding: "80px 0 60px", borderBottom: "1px solid var(--line)" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 48, alignItems: "center" }}>
          <div>
            <p className="eyebrow">Activation Apple CarPlay & Android Auto</p>
            <h1 style={{ fontSize: 46, lineHeight: 1.08, margin: "16px 0" }}>
              Débloquez CarPlay sur votre écran d'origine, sans changer d'autoradio.
            </h1>
            <p style={{ fontSize: 17, maxWidth: 460 }}>
              Chaque véhicule a son propre fichier d'activation. Choisissez la marque, le modèle et
              l'année de votre voiture, et recevez exactement ce qu'il vous faut.
            </p>
            <div style={{ display: "flex", gap: 14, marginTop: 28 }}>
              <a href="#produits" className="btn btn-primary">Voir les formules</a>
              <a href="#comment-ca-marche" className="btn btn-secondary">Comment ça marche</a>
            </div>
            {vehicleCount > 0 && (
              <p style={{ marginTop: 20, fontSize: 13 }} className="mono">
                {vehicleCount} véhicule{vehicleCount > 1 ? "s" : ""} disponible{vehicleCount > 1 ? "s" : ""} au catalogue
              </p>
            )}
          </div>

          {/* Signature visuelle : écran d'autoradio qui "boot" sur CarPlay */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
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
          </div>
        </div>
      </section>

      {/* FORMULES */}
      <section id="produits" style={{ padding: "72px 0" }}>
        <div className="container">
          <p className="eyebrow">Deux formules</p>
          <h2 style={{ fontSize: 32, margin: "10px 0 40px" }}>Choisissez votre formule</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Formule 1 */}
            <div className="card">
              <p className="eyebrow" style={{ color: "var(--text-muted)" }}>Formule 1</p>
              <h3 style={{ fontSize: 24, margin: "10px 0" }}>Fichiers seuls</h3>
              <p style={{ margin: "8px 0 20px" }}>
                Vous recevez immédiatement par email le fichier d'activation propre à votre véhicule
                et son guide PDF. Vous préparez vous-même votre carte mémoire.
              </p>
              <ul style={{ margin: "0 0 24px", padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                {["Fichier d'activation propre à votre véhicule", "Guide PDF pas à pas", "Envoi automatique par email", "Support par email"].map((f) => (
                  <li key={f} style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--text-muted)" }}>
                    <span style={{ color: "var(--success)" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/vehicules?formule=fichiers" className="btn btn-primary" style={{ width: "100%" }}>
                Choisir mon véhicule
              </Link>
            </div>

            {/* Formule 2 */}
            <div className="card" style={{ borderColor: "var(--cyan)", position: "relative" }}>
              <span className="badge badge-shipped" style={{ position: "absolute", top: 28, right: 28 }}>Le plus choisi</span>
              <p className="eyebrow">Formule 2</p>
              <h3 style={{ fontSize: 24, margin: "10px 0" }}>Carte mémoire prête à l'emploi</h3>
              <p style={{ margin: "8px 0 20px" }}>
                On prépare pour vous une carte mémoire avec le fichier de votre véhicule déjà
                installé, envoyée chez vous par courrier, avec le guide PDF final.
              </p>
              <ul style={{ margin: "0 0 24px", padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                {["Carte mémoire préparée par nos soins", "Envoi postal à votre adresse", "Guide PDF envoyé par email", "Aucune manipulation de fichiers"].map((f) => (
                  <li key={f} style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--text-muted)" }}>
                    <span style={{ color: "var(--success)" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/vehicules?formule=carte" className="btn btn-amber" style={{ width: "100%" }}>
                Choisir mon véhicule
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="comment-ca-marche" style={{ padding: "72px 0", borderTop: "1px solid var(--line)" }}>
        <div className="container">
          <p className="eyebrow">Processus</p>
          <h2 style={{ fontSize: 32, margin: "10px 0 40px" }}>Comment ça marche</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {[
              ["01", "Choisissez", "Sélectionnez une formule, puis la marque/modèle/année de votre voiture."],
              ["02", "Payez", "Par carte bancaire ou PayPal, en toute sécurité."],
              ["03", "Recevez", "Vos fichiers arrivent par email immédiatement. La carte physique part sous 48h."],
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
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a href={`mailto:${contactEmail}`} className="card" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, minWidth: 220 }}>
              <span style={{ fontSize: 22 }}>✉️</span>
              <div>
                <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>Email</p>
                <p style={{ fontSize: 13 }}>{contactEmail}</p>
              </div>
            </a>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="card" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, minWidth: 220 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
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
              <div>
                <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>Instagram</p>
                <p style={{ fontSize: 13 }}>Notre page officielle</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
