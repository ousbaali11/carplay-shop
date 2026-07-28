import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 80, padding: "40px 0" }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <p style={{ fontSize: 13 }}>© {new Date().getFullYear()} CarPlayActiv. Tous droits réservés.</p>
        <div style={{ display: "flex", gap: 20 }}>
          <Link href="/cgv" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>CGV</Link>
          <Link href="/compte/connexion" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>Mon compte</Link>
        </div>
      </div>
    </footer>
  );
}
