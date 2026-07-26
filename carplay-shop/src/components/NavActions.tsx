"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

// Bouton "Retour" (page précédente, pour corriger une info) + bouton "Annuler"
// (retour direct à l'accueil, pour abandonner l'action en cours).
export default function NavActions({ cancelHref = "/" }: { cancelHref?: string }) {
  const router = useRouter();

  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
      <button
        type="button"
        onClick={() => router.back()}
        className="btn btn-secondary"
        style={{ fontSize: 13, padding: "8px 16px" }}
      >
        ← Retour
      </button>
      <Link
        href={cancelHref}
        className="btn btn-secondary"
        style={{ fontSize: 13, padding: "8px 16px", textDecoration: "none" }}
      >
        ✕ Annuler
      </Link>
    </div>
  );
}