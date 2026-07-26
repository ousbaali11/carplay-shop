import Link from "next/link";

export default function Header() {
  return (
    <header style={{ borderBottom: "1px solid var(--line)", position: "sticky", top: 0, background: "rgba(16,19,23,0.85)", backdropFilter: "blur(8px)", zIndex: 50 }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <rect x="1" y="1" width="28" height="28" rx="7" stroke="#00c2ce" strokeWidth="2"/>
            <path d="M9 19V13.5C9 12.1 10.1 11 11.5 11H18.5C19.9 11 21 12.1 21 13.5V19" stroke="#00c2ce" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="11" cy="19" r="1.6" fill="#00c2ce"/>
            <circle cx="19" cy="19" r="1.6" fill="#00c2ce"/>
          </svg>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
            CarPlay<span style={{ color: "var(--cyan)" }}>Activ</span>
          </span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Link href="/#produits" style={{ fontSize: 14, textDecoration: "none", color: "var(--text-muted)" }}>Produits</Link>
          <Link href="/#comment-ca-marche" style={{ fontSize: 14, textDecoration: "none", color: "var(--text-muted)" }}>Comment ça marche</Link>
          <Link href="/#contact" style={{ fontSize: 14, textDecoration: "none", color: "var(--text-muted)" }}>Contact</Link>
          <Link href="/compte" style={{ fontSize: 14, textDecoration: "none", color: "var(--text-muted)" }}>Mon compte</Link>
          <Link href="/#produits" className="btn btn-primary" style={{ padding: "10px 18px", fontSize: 14 }}>Commander</Link>
        </nav>
      </div>
    </header>
  );
}
