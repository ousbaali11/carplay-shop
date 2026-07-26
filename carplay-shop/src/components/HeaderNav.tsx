"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/#produits", label: "Produits" },
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
  { href: "/#contact", label: "Contact" },
  { href: "/compte", label: "Mon compte" },
];

export default function HeaderNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="desktop-nav">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} style={{ fontSize: 14, textDecoration: "none", color: "var(--text-muted)" }}>
            {l.label}
          </Link>
        ))}
        <Link href="/#produits" className="btn btn-primary" style={{ padding: "10px 18px", fontSize: 14 }}>
          Commander
        </Link>
      </nav>

      <button className="mobile-menu-btn" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        )}
      </button>

      {open && (
        <div className="mobile-nav-panel open" style={{ position: "absolute", top: 72, left: 0, right: 0 }}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ fontSize: 15, textDecoration: "none", color: "var(--text)", padding: "10px 0" }}>
              {l.label}
            </Link>
          ))}
          <Link href="/#produits" onClick={() => setOpen(false)} className="btn btn-primary" style={{ marginTop: 8, textAlign: "center" }}>
            Commander
          </Link>
        </div>
      )}
    </>
  );
}