"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactSettingsForm({
  initialContactEmail,
  initialInstagramUrl,
}: {
  initialContactEmail: string;
  initialInstagramUrl: string;
}) {
  const router = useRouter();
  const [contactEmail, setContactEmail] = useState(initialContactEmail);
  const [instagramUrl, setInstagramUrl] = useState(initialInstagramUrl);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    const res = await fetch("/api/admin/settings/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactEmail, instagramUrl }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Échec de l'enregistrement.");
    }
  }

  return (
    <div className="card" style={{ display: "grid", gap: 14, maxWidth: 480 }}>
      <div>
        <label>Email de contact (affiché sur l'accueil)</label>
        <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
      </div>
      <div>
        <label>Lien de la page Instagram</label>
        <input type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." />
      </div>
      {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        {saved && <span style={{ color: "var(--success)", fontSize: 13 }}>✓ Enregistré</span>}
      </div>
    </div>
  );
}