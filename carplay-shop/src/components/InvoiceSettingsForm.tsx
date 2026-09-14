"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InvoiceSettingsForm({ initialEnabled }: { initialEnabled: boolean }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(value: boolean) {
    setEnabled(value);
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoicesEnabled: value }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="card toggle-card w-480">
      <div>
        <p className="field-title">Factures automatiques</p>
        <p className="field-desc-inline">
          {enabled
            ? "Le client reçoit sa facture par email et peut la retélécharger depuis son espace."
            : "Aucune facture n'est générée : l'email de confirmation part sans pièce jointe, et le lien facture disparaît de l'espace client."}
        </p>
        {saved && <p className="form-success sm">✓ Enregistré</p>}
      </div>
      <label className="switch-label">
        <input type="checkbox" checked={enabled} disabled={saving} onChange={(e) => save(e.target.checked)} className="switch-input" />
      </label>
    </div>
  );
}
