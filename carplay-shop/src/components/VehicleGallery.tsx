"use client";

import { useState } from "react";
import Lightbox from "@/components/Lightbox";

export default function VehicleGallery({ imageIds, title }: { imageIds: string[]; title: string }) {
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (imageIds.length === 0) {
    return (
      <div className="no-photo-box">
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
        className="gallery-main"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/vehicules/image/${imageIds[activeImg]}`}
          alt={title}
          className="gallery-img"
        />
        <span className="zoom-hint lg">
          ⤢
        </span>
        {imageIds.length > 1 && (
          <span className="mono photo-count-pill lg">
            {imageIds.length} photos
          </span>
        )}
      </div>

      {imageIds.length > 1 && (
        <div className="gallery-thumbs">
          {imageIds.map((id, i) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveImg(i)}
              aria-label={`Voir la photo ${i + 1}`}
              aria-pressed={i === activeImg}
              className={`gallery-thumb${i === activeImg ? " is-active" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/vehicules/image/${id}`} alt="" className="thumb-img" />
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
