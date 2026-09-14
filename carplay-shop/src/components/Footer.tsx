import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <p className="footer-copy">© {new Date().getFullYear()} CarPlayActiv. Tous droits réservés.</p>
        <div className="footer-links">
          <Link href="/cgv" className="footer-link">CGV</Link>
          <Link href="/compte/connexion" className="footer-link">Mon compte</Link>
          <Link href="/admin/connexion" className="footer-link">Administration</Link>
        </div>
      </div>
    </footer>
  );
}
