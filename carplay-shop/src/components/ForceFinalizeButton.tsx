"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForceFinalizeButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!confirm("Générer maintenant le lien de téléchargement et envoyer l'email de confirmation pour cette commande ?")) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/orders/${orderId}/force-finalize`, { method: "POST" });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Échec de la finalisation.");
    }
  }

  return (
    <div className="card" style={{ borderColor: "var(--amber)", marginBottom: 20 }}>
      <p className="eyebrow" style={{ color: "var(--amber)", marginBottom: 10 }}>Commande bloquée</p>
      <p style={{ fontSize: 13, marginBottom: 12 }}>
        Aucun lien de téléchargement n'a été généré pour cette commande — le paiement a probablement
        été reçu, mais la confirmation n'a jamais abouti côté serveur (souci de connexion ponctuel).
        Ce bouton refait cette étape manuellement : génère le lien, attache les fichiers, envoie
        l'email au client.
      </p>
      {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 10 }}>{error}</p>}
      <button className="btn btn-primary" onClick={run} disabled={loading}>
        {loading ? "..." : "Forcer la finalisation"}
      </button>
    </div>
  );
}
