import Link from "next/link";

// Coupe le nom du site à la 2e lettre majuscule : la partie avant reste blanche,
// la partie à partir de cette 2e majuscule prend la couleur du bouton "Commander"
// (ex: "CarplayActiv" -> "Carplay" blanc + "Activ" en couleur). Si le nom ne
// contient pas 2 majuscules, il reste entièrement blanc (pas de césure hasardeuse).
function splitSiteName(name: string): { first: string; second: string } {
  const upperIndices: number[] = [];
  for (let i = 0; i < name.length; i++) {
    if (name[i] >= "A" && name[i] <= "Z") upperIndices.push(i);
  }
  if (upperIndices.length < 2) return { first: name, second: "" };
  const splitAt = upperIndices[1];
  return { first: name.slice(0, splitAt), second: name.slice(splitAt) };
}

export default function SiteBrand({ siteName, logoUrl, href = "/", logoHeight = 38 }: { siteName: string; logoUrl: string | null; href?: string; logoHeight?: number }) {
  const { first, second } = splitSiteName(siteName);

  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={siteName} style={{ height: logoHeight, width: "auto", display: "block" }} />
      ) : (
        <svg width={logoHeight} height={logoHeight} viewBox="0 0 30 30" fill="none">
          <rect x="1" y="1" width="28" height="28" rx="7" stroke="#00c2ce" strokeWidth="2" />
          <path d="M9 19V13.5C9 12.1 10.1 11 11.5 11H18.5C19.9 11 21 12.1 21 13.5V19" stroke="#00c2ce" strokeWidth="2" strokeLinecap="round" />
          <circle cx="11" cy="19" r="1.6" fill="#00c2ce" />
          <circle cx="19" cy="19" r="1.6" fill="#00c2ce" />
        </svg>
      )}
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
        <span style={{ color: "var(--text)" }}>{first}</span>
        {second && <span style={{ color: "var(--cyan)" }}>{second}</span>}
      </span>
    </Link>
  );
}
