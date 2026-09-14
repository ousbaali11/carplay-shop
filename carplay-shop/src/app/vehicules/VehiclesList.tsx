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
  const hasImages = v.imageIds.length > 0;

  return (
    <div className="card vehicle-card card-hover">
      <div
        role={hasImages ? "button" : undefined}
        aria-label={hasImages ? `Agrandir la photo de ${v.title}` : undefined}
        onClick={() => hasImages && setLightboxOpen(true)}
        onMouseEnter={() => v.imageIds.length > 1 && setActiveImg(1)}
        onMouseLeave={() => setActiveImg(0)}
        className={`vehicle-card-media${hasImages ? " zoomable" : ""}`}
      >
        {hasImages ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/vehicules/image/${v.imageIds[activeImg] || v.imageIds[0]}`} alt={v.title} className="vehicle-card-img" />
        ) : (
          <span className="no-photo">Pas de photo</span>
        )}
        {v.imageIds.length > 1 && (
          <span className="mono photo-count-pill">
            {v.imageIds.length} photos
          </span>
        )}
        {hasImages && (
          <span className="zoom-hint">
            ⤢
          </span>
        )}
      </div>

      <Link href={`/vehicules/${v.id}`} className="vehicle-info-link vehicle-card-body">
        <p className="vehicle-card-title tight">{v.title}</p>
        {v.description && (
          <div className="rich-content vehicle-card-desc mt-6" dangerouslySetInnerHTML={{ __html: v.description }} />
        )}
        <div className="vehicle-card-footer">
          <p className="price-text">À partir de {eur(v.priceFromCents)}</p>
          <span className="order-hint">Voir l'annonce →</span>
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
        className="search-input"
        aria-label="Rechercher une annonce"
      />

      {filtered.length === 0 ? (
        <p>Aucune annonce ne correspond à votre recherche. Contactez-nous, votre véhicule est peut-être disponible prochainement.</p>
      ) : (
        <div className="vehicle-grid">
          {filtered.map((v) => (
            <VehicleCard key={v.id} v={v} />
          ))}
        </div>
      )}
    </div>
  );
}
