"use client";

import { useState } from "react";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";

const LINKS = [
  { href: "/#annonces", label: "Annonces" },
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
          <Link key={l.href} href={l.href} className="nav-link">
            {l.label}
          </Link>
        ))}
        <UserAvatar />
      </nav>

      <button className="mobile-menu-btn" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        )}
      </button>

      {open && (
        <div className="mobile-nav-panel open">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="nav-link">
              {l.label}
            </Link>
          ))}
          <div className="mobile-nav-avatar">
            <UserAvatar />
          </div>
        </div>
      )}
    </>
  );
}
