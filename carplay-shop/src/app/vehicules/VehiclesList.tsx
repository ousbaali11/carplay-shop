"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: string;
  description: string | null;
  imageIds: string[];
  priceCents: number;
};

function eur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

// Plein écran : clic sur une photo pour l'agrandir, flèches si plusieurs photos,
// fermeture au clic en dehors, à la croix, ou avec la touche Échap.
function Lightbox({ imageIds, startIndex, label, onClose }: { imageIds: string[]; startIndex: number; label: string; onClose: () => void }) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % imageIds.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + imageIds.length) % imageIds.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imageIds.length, onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(6,8,10,0.92)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <button
        onClick={onClose}
        aria-label="Fermer"
        style={{
          position: "absolute", top: 20, right: 24, background: "none", border: "none",
          color: "#fff", fontSize: 32, lineHeight: 1, cursor: "pointer",
        }}
      >
        ×
      </button>

      {imageIds.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIndex((i) => (i - 1 + imageIds.length) % imageIds.length); }}
          aria-label="Photo précédente"
          style={{ position: "absolute", left: 16, background: "none", border: "none", color: "#fff", fontSize: 40, cursor: "pointer", padding: 12 }}
        >
          ‹
        </button>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/vehicules/image/${imageIds[index]}`}
        alt={label}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 8 }}
      />

      {imageIds.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIndex((i) => (i + 1) % imageIds.length); }}
          aria-label="Photo suivante"
          style={{ position: "absolute", right: 16, background: "none", border: "none", color: "#fff", fontSize: 40, cursor: "pointer", padding: 12 }}
        >
          ›
        </button>
      )}

      {imageIds.length > 1 && (
        <span className="mono" style={{ position: "absolute", bottom: 24, color: "#ccc", fontSize: 12 }}>
          {index + 1} / {imageIds.length}
        </span>
      )}
    </div>
  );
}

function VehicleCard({ v, formula }: { v: Vehicle; formula: string }) {
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const label = `${v.brand} ${v.model}`;

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        role={v.imageIds.length > 0 ? "button" : undefined}
        aria-label={v.imageIds.length > 0 ? `Agrandir la photo de ${label}` : undefined}
        onClick={() => v.imageIds.length > 0 && setLightboxOpen(true)}
        onMouseEnter={() => v.imageIds.length > 1 && setActiveImg(1)}
        onMouseLeave={() => setActiveImg(0)}
        style={{
          aspectRatio: "16/10", background: "var(--bg-elevated)", display: "flex",
          alignItems: "center", justifyContent: "center", position: "relative",
          cursor: v.imageIds.length > 0 ? "zoom-in" : "default",
        }}
      >
        {v.imageIds.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/vehicules/image/${v.imageIds[activeImg] || v.imageIds[0]}`} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Pas de photo</span>
        )}
        {v.imageIds.length > 1 && (
          <span className="mono" style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, padding: "2px 8px", borderRadius: 999 }}>
            {v.imageIds.length} photos
          </span>
        )}
        {v.imageIds.length > 0 && (
          <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 13, width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ⤢
          </span>
        )}
      </div>

      <Link href={`/checkout?vehicule=${v.id}&formule=${formula}`} style={{ padding: 16, textDecoration: "none", display: "block" }}>
        <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 15 }}>{v.brand} {v.model}</p>
        <p className="mono" style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{v.year}</p>
        {v.description && <p style={{ fontSize: 13, marginBottom: 10 }}>{v.description}</p>}
        <p style={{ color: "var(--cyan)", fontWeight: 700, fontFamily: "var(--font-display)" }}>{eur(v.priceCents)}</p>
      </Link>

      {lightboxOpen && (
        <Lightbox imageIds={v.imageIds} startIndex={activeImg} label={label} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}

export default function VehiclesList({ vehicles, formula }: { vehicles: Vehicle[]; formula: string }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) => `${v.brand} ${v.model} ${v.year}`.toLowerCase().includes(q));
  }, [vehicles, query]);

  return (
    <div>
      <input
        placeholder="Rechercher une marque, un modèle, une année..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 28, maxWidth: 420 }}
      />

      {filtered.length === 0 ? (
        <p>Aucun véhicule ne correspond à votre recherche. Contactez-nous, votre véhicule est peut-être disponible prochainement.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
          {filtered.map((v) => (
            <VehicleCard key={v.id} v={v} formula={formula} />
          ))}
        </div>
      )}
    </div>
  );
}