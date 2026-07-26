"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentSettingsForm({
  initialStripeEnabled,
  initialPaypalEnabled,
}: {
  initialStripeEnabled: boolean;
  initialPaypalEnabled: boolean;
}) {
  const router = useRouter();
  const [stripeEnabled, setStripeEnabled] = useState(initialStripeEnabled);
  const [paypalEnabled, setPaypalEnabled] = useState(initialPaypalEnabled);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stripeEnabled, paypalEnabled }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  const bothDisabled = !stripeEnabled && !paypalEnabled;

  return (
    <div className="card" style={{ display: "grid", gap: 18, maxWidth: 480 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ color: "var(--text)", fontWeight: 600 }}>Carte bancaire (Stripe)</p>
          <p style={{ fontSize: 13 }}>Visible au checkout si activé.</p>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={stripeEnabled} onChange={(e) => setStripeEnabled(e.target.checked)} style={{ width: 20, height: 20 }} />
        </label>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ color: "var(--text)", fontWeight: 600 }}>PayPal</p>
          <p style={{ fontSize: 13 }}>Le client se connecte à son compte PayPal pour payer.</p>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={paypalEnabled} onChange={(e) => setPaypalEnabled(e.target.checked)} style={{ width: 20, height: 20 }} />
        </label>
      </div>

      {bothDisabled && (
        <p style={{ color: "var(--amber)", fontSize: 13 }}>
          ⚠️ Si les deux sont désactivés, les clients ne pourront plus payer du tout sur le site.
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        {saved && <span style={{ color: "var(--success)", fontSize: 13 }}>✓ Enregistré</span>}
      </div>
    </div>
  );
}
