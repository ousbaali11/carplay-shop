"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SendFilesForm({
  orderId,
  existingLinks,
  filesSentAt,
}: {
  orderId: string;
  existingLinks: { id: string; url: string; used: boolean; usedAt: Date | null }[];
  filesSentAt: Date | null;
}) {
  const router = useRouter();
  const [links, setLinks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/orders/${orderId}/send-files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ links }),
    });
    setLoading(false);
    if (res.ok) {
      setLinks("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Échec de l'envoi.");
    }
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <p className="eyebrow" style={{ marginBottom: 10 }}>Liens d'activation (Google Drive) — {existingLinks.length}</p>

      {existingLinks.length > 0 && (
        <ul style={{ margin: "0 0 14px", padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
          {existingLinks.map((l, i) => (
            <li key={l.id} style={{ fontSize: 13, background: "var(--bg-elevated)", padding: "6px 10px", borderRadius: 6 }}>
              Lien #{i + 1} : {l.used ? (
                <span style={{ color: "var(--amber)" }}>déjà téléchargé le {l.usedAt?.toLocaleDateString("fr-FR")}</span>
              ) : (
                <span style={{ color: "var(--success)" }}>pas encore téléchargé</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <p style={{ fontSize: 13, marginBottom: 6 }}>
        {filesSentAt
          ? `Client déjà notifié le ${filesSentAt.toLocaleDateString("fr-FR")}. Tu peux ajouter d'autres liens et renvoyer l'email si besoin.`
          : "Colle ici le(s) lien(s) Google Drive à livrer au client pour cette commande, un par ligne."}
      </p>
      <textarea
        rows={3}
        value={links}
        onChange={(e) => setLinks(e.target.value)}
        placeholder={"https://drive.google.com/lien-1\nhttps://drive.google.com/lien-2"}
      />
      {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 8 }}>{error}</p>}
      <button className="btn btn-primary" onClick={send} disabled={loading} style={{ marginTop: 10 }}>
        {loading ? "Envoi..." : filesSentAt ? "Ajouter et renvoyer l'email" : "Enregistrer et envoyer au client"}
      </button>
    </div>
  );
}
