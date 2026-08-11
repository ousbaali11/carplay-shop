import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Favicon généré en code (pas de fichier image à gérer), réutilisant exactement
// le même dessin que le logo par défaut affiché ailleurs sur le site.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0c1013",
          borderRadius: 7,
          border: "2px solid #00c2ce",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
          <path d="M9 19V13.5C9 12.1 10.1 11 11.5 11H18.5C19.9 11 21 12.1 21 13.5V19" stroke="#00c2ce" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="11" cy="19" r="1.8" fill="#00c2ce" />
          <circle cx="19" cy="19" r="1.8" fill="#00c2ce" />
        </svg>
      </div>
    ),
    { ...size }
  );
}