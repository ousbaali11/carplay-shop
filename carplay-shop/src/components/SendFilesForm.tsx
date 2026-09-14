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
    <div className="card mb-20">
      <p className="eyebrow mb-10">Liens d'activation (Google Drive) — {existingLinks.length}</p>

      {existingLinks.length > 0 && (
        <ul className="file-list mb-14">
          {existingLinks.map((l, i) => (
            <li key={l.id} className="file-item">
              Lien #{i + 1} : {l.used ? (
                <span className="text-amber">déjà téléchargé le {l.usedAt?.toLocaleDateString("fr-FR")}</span>
              ) : (
                <span className="text-success">pas encore téléchargé</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="note">
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
      {error && <p className="form-error mt-8">{error}</p>}
      <button className="btn btn-primary mt-10" onClick={send} disabled={loading}>
        {loading ? "Envoi..." : filesSentAt ? "Ajouter et renvoyer l'email" : "Enregistrer et envoyer au client"}
      </button>
    </div>
  );
}
