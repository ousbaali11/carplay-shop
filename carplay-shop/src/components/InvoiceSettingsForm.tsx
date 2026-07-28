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
    <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 480 }}>
      <div>
        <p style={{ color: "var(--text)", fontWeight: 600 }}>Factures automatiques</p>
        <p style={{ fontSize: 13, marginTop: 4 }}>
          {enabled
            ? "Le client reçoit sa facture par email et peut la retélécharger depuis son espace."
            : "Aucune facture n'est générée : l'email de confirmation part sans pièce jointe, et le lien facture disparaît de l'espace client."}
        </p>
        {saved && <p style={{ color: "var(--success)", fontSize: 12, marginTop: 6 }}>✓ Enregistré</p>}
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input type="checkbox" checked={enabled} disabled={saving} onChange={(e) => save(e.target.checked)} style={{ width: 20, height: 20 }} />
      </label>
    </div>
  );
}