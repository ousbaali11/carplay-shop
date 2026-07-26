import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default function AdminSidebar({ active }: { active: "commandes" | "vehicules" | "parametres" | "utilisateurs" | "mon-compte" | "integrations" }) {
  const items: { key: typeof active; label: string; href: string }[] = [
    { key: "commandes", label: "Commandes", href: "/admin" },
    { key: "vehicules", label: "Véhicules", href: "/admin/vehicules" },
    { key: "utilisateurs", label: "Utilisateurs", href: "/admin/utilisateurs" },
    { key: "parametres", label: "Paiement", href: "/admin/parametres" },
    { key: "integrations", label: "Intégrations", href: "/admin/integrations" },
    { key: "mon-compte", label: "Mon compte", href: "/admin/mon-compte" },
  ];

  return (
    <aside className="admin-sidebar" style={{ width: 220, borderRight: "1px solid var(--line)", padding: "28px 20px", display: "flex", flexDirection: "column", gap: 24, minHeight: "100vh" }}>
      <div className="admin-eyebrow">
        <p className="eyebrow">Administration</p>
      </div>
      <nav style={{ display: "grid", gap: 6 }}>
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: 14,
              color: active === item.key ? "var(--text)" : "var(--text-muted)",
              background: active === item.key ? "var(--bg-card)" : "transparent",
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="admin-signout" style={{ marginTop: "auto" }}>
        <SignOutButton />
      </div>
    </aside>
  );
}