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
    <div className="card form-card gap-18 w-480">
      <div className="toggle-row">
        <div>
          <p className="field-title">Carte bancaire (Stripe)</p>
          <p className="field-desc-sm">Visible au checkout si activé.</p>
        </div>
        <label className="switch-label">
          <input type="checkbox" checked={stripeEnabled} onChange={(e) => setStripeEnabled(e.target.checked)} className="switch-input" />
        </label>
      </div>

      <div className="toggle-row">
        <div>
          <p className="field-title">PayPal</p>
          <p className="field-desc-sm">Le client se connecte à son compte PayPal pour payer.</p>
        </div>
        <label className="switch-label">
          <input type="checkbox" checked={paypalEnabled} onChange={(e) => setPaypalEnabled(e.target.checked)} className="switch-input" />
        </label>
      </div>

      {bothDisabled && (
        <p className="form-warning">
          ⚠️ Si les deux sont désactivés, les clients ne pourront plus payer du tout sur le site.
        </p>
      )}

      <div className="form-actions">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        {saved && <span className="form-success">✓ Enregistré</span>}
      </div>
    </div>
  );
}
