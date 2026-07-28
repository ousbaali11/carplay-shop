import Link from "next/link";

export default function SiteBrand({ siteName, logoUrl, href = "/" }: { siteName: string; logoUrl: string | null; href?: string }) {
  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={siteName} style={{ height: 38, width: "auto", display: "block" }} />
      ) : (
        <svg width="38" height="38" viewBox="0 0 30 30" fill="none">
          <rect x="1" y="1" width="28" height="28" rx="7" stroke="#00c2ce" strokeWidth="2" />
          <path d="M9 19V13.5C9 12.1 10.1 11 11.5 11H18.5C19.9 11 21 12.1 21 13.5V19" stroke="#00c2ce" strokeWidth="2" strokeLinecap="round" />
          <circle cx="11" cy="19" r="1.6" fill="#00c2ce" />
          <circle cx="19" cy="19" r="1.6" fill="#00c2ce" />
        </svg>
      )}
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>{siteName}</span>
    </Link>
  );
}