"use client";

import { useEffect, useState } from "react";

// Plein écran : clic sur une photo pour l'agrandir, flèches si plusieurs photos,
// fermeture au clic en dehors, à la croix, ou avec la touche Échap.
export default function Lightbox({
  imageIds,
  startIndex,
  label,
  onClose,
}: {
  imageIds: string[];
  startIndex: number;
  label: string;
  onClose: () => void;
}) {
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
