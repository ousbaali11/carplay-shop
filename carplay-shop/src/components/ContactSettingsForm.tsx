"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactSettingsForm({
  initialContactEmail,
  initialInstagramUrl,
  initialWhatsappUrl,
}: {
  initialContactEmail: string;
  initialInstagramUrl: string;
  initialWhatsappUrl: string;
}) {
  const router = useRouter();
  const [contactEmail, setContactEmail] = useState(initialContactEmail);
  const [instagramUrl, setInstagramUrl] = useState(initialInstagramUrl);
  const [whatsappUrl, setWhatsappUrl] = useState(initialWhatsappUrl);
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
      body: JSON.stringify({ contactEmail, instagramUrl, whatsappUrl }),
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
    <div className="card form-card w-480">
      <div>
        <label>Email de contact (affiché sur l'accueil)</label>
        <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
      </div>
      <div>
        <label>Lien de la page Instagram</label>
        <input type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." />
      </div>
      <div>
        <label>Lien WhatsApp (laisse vide pour masquer le bouton)</label>
        <input type="url" value={whatsappUrl} onChange={(e) => setWhatsappUrl(e.target.value)} placeholder="https://wa.me/33612345678" />
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        {saved && <span className="form-success">✓ Enregistré</span>}
      </div>
    </div>
  );
}
