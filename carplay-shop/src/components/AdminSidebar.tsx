import Link from "next/link";

type Key = "commandes" | "vehicules" | "parametres" | "utilisateurs" | "mon-compte" | "integrations" | "apparence" | "activations";

// Icônes (18px, trait courant) : masquées en interface Standard, affichées en Premium.
const ICONS: Record<Key, React.ReactNode> = {
  commandes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><path d="M9 8h6M9 12h6" />
    </svg>
  ),
  vehicules: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15l1.5-5A2 2 0 017.4 8.5h9.2a2 2 0 011.9 1.5L20 15" /><rect x="3" y="15" width="18" height="4" rx="1.5" /><circle cx="7.5" cy="19" r="1.5" /><circle cx="16.5" cy="19" r="1.5" />
    </svg>
  ),
  activations: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="12" r="4" /><path d="M12 12h9M18 12v3M15 12v2" />
    </svg>
  ),
  utilisateurs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0" /><path d="M16 4.5a3.5 3.5 0 010 7M21.5 20a6.5 6.5 0 00-5-6.3" />
    </svg>
  ),
  parametres: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19M6.5 15h4" />
    </svg>
  ),
  integrations: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3v4M15 3v4M7 7h10v4a5 5 0 01-10 0V7zM12 16v5" />
    </svg>
  ),
  apparence: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 100 18c1.5 0 2-1 2-2s-1-2 0-3 2-1 3-1 3-.5 3-3a9 9 0 00-8-9z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7" r="1" />
    </svg>
  ),
  "mon-compte": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="10" r="3" /><path d="M6.5 18.5a6 6 0 0111 0" />
    </svg>
  ),
};

export default function AdminSidebar({ active }: { active: Key }) {
  const items: { key: Key; label: string; href: string }[] = [
    { key: "commandes", label: "Commandes", href: "/admin" },
    { key: "vehicules", label: "Véhicules", href: "/admin/vehicules" },
    { key: "activations", label: "Activations", href: "/admin/activations" },
    { key: "utilisateurs", label: "Utilisateurs", href: "/admin/utilisateurs" },
    { key: "parametres", label: "Paiement", href: "/admin/parametres" },
    { key: "integrations", label: "Intégrations", href: "/admin/integrations" },
    { key: "apparence", label: "Apparence", href: "/admin/apparence" },
    { key: "mon-compte", label: "Mon compte", href: "/admin/mon-compte" },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-eyebrow">
        <p className="eyebrow">Administration</p>
      </div>
      <nav className="admin-nav" aria-label="Menu d'administration">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`admin-nav-link${active === item.key ? " is-active" : ""}`}
            aria-current={active === item.key ? "page" : undefined}
          >
            <span className="admin-nav-icon" aria-hidden="true">{ICONS[item.key]}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
