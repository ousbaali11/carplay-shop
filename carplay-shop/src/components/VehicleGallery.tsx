"use client";

import { useState } from "react";
import Lightbox from "@/components/Lightbox";

export default function VehicleGallery({ imageIds, title }: { imageIds: string[]; title: string }) {
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (imageIds.length === 0) {
    return (
      <div style={{ aspectRatio: "16/10", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Pas de photo
      </div>
    );
  }

  return (
    <>
      <div
        role="button"
        aria-label={`Agrandir la photo de ${title}`}
        onClick={() => setLightboxOpen(true)}
        style={{ position: "relative", cursor: "zoom-in" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/vehicules/image/${imageIds[activeImg]}`}
          alt={title}
          style={{ width: "100%", aspectRatio: "16/10", objectFit: "cover", display: "block" }}
        />
        <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 14, width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          ⤢
        </span>
        {imageIds.length > 1 && (
          <span className="mono" style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, padding: "2px 8px", borderRadius: 999 }}>
            {imageIds.length} photos
          </span>
        )}
      </div>

      {imageIds.length > 1 && (
        <div style={{ display: "flex", gap: 8, padding: 10, flexWrap: "wrap" }}>
          {imageIds.map((id, i) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveImg(i)}
              aria-label={`Voir la photo ${i + 1}`}
              style={{
                padding: 0, border: i === activeImg ? "2px solid var(--cyan)" : "2px solid transparent",
                borderRadius: 6, overflow: "hidden", cursor: "pointer", width: 56, height: 42, background: "none",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/vehicules/image/${id}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox imageIds={imageIds} startIndex={activeImg} label={title} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}
