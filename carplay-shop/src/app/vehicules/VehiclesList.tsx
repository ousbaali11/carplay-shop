"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Lightbox from "@/components/Lightbox";

type Vehicle = {
  id: string;
  title: string;
  description: string | null;
  imageIds: string[];
  priceFromCents: number;
};

function eur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function VehicleCard({ v }: { v: Vehicle }) {
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        role={v.imageIds.length > 0 ? "button" : undefined}
        aria-label={v.imageIds.length > 0 ? `Agrandir la photo de ${v.title}` : undefined}
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
          <img src={`/api/vehicules/image/${v.imageIds[activeImg] || v.imageIds[0]}`} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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

      <Link href={`/vehicules/${v.id}`} className="vehicle-info-link" style={{ padding: 16, textDecoration: "none", display: "block" }}>
        <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 15 }}>{v.title}</p>
        {v.description && (
          <div className="rich-content" style={{ fontSize: 13, margin: "6px 0 10px" }} dangerouslySetInnerHTML={{ __html: v.description }} />
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ color: "var(--cyan)", fontWeight: 700, fontFamily: "var(--font-display)" }}>À partir de {eur(v.priceFromCents)}</p>
          <span className="order-hint" style={{ fontSize: 12, color: "var(--cyan)", fontWeight: 600 }}>Voir l'annonce →</span>
        </div>
      </Link>

      {lightboxOpen && (
        <Lightbox imageIds={v.imageIds} startIndex={activeImg} label={v.title} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}

export default function VehiclesList({ vehicles }: { vehicles: Vehicle[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) => v.title.toLowerCase().includes(q));
  }, [vehicles, query]);

  return (
    <div>
      <input
        placeholder="Rechercher une annonce..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 28, maxWidth: 420 }}
      />

      {filtered.length === 0 ? (
        <p>Aucune annonce ne correspond à votre recherche. Contactez-nous, votre véhicule est peut-être disponible prochainement.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
          {filtered.map((v) => (
            <VehicleCard key={v.id} v={v} />
          ))}
        </div>
      )}
    </div>
  );
}
