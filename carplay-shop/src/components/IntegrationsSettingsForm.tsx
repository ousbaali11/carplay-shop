"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  stripeSecretKeySet: boolean;
  stripeWebhookSecretSet: boolean;
  paypalClientId: string;
  paypalClientSecretSet: boolean;
  paypalEnv: string;
  resendApiKeySet: boolean;
  emailFrom: string;
  adminNotificationEmail: string;
  companyName: string;
  companyAddress: string;
};

function SecretField({ label, placeholderWhenSet, value, onChange, help }: { label: string; placeholderWhenSet: boolean; value: string; onChange: (v: string) => void; help?: string }) {
  return (
    <div>
      <label>{label} {placeholderWhenSet && <span style={{ color: "var(--success)", fontSize: 12 }}>· déjà configuré</span>}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholderWhenSet ? "•••••••••••••••• (laisser vide pour ne pas changer)" : "Non configuré"}
        autoComplete="off"
      />
      {help && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{help}</p>}
    </div>
  );
}

export default function IntegrationsSettingsForm(props: Props) {
  const router = useRouter();
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");
  const [paypalClientId, setPaypalClientId] = useState(props.paypalClientId);
  const [paypalClientSecret, setPaypalClientSecret] = useState("");
  const [paypalEnv, setPaypalEnv] = useState(props.paypalEnv);
  const [resendApiKey, setResendApiKey] = useState("");
  const [emailFrom, setEmailFrom] = useState(props.emailFrom);
  const [adminNotificationEmail, setAdminNotificationEmail] = useState(props.adminNotificationEmail);
  const [companyName, setCompanyName] = useState(props.companyName);
  const [companyAddress, setCompanyAddress] = useState(props.companyAddress);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stripeSecretKey,
        stripeWebhookSecret,
        paypalClientId,
        paypalClientSecret,
        paypalEnv,
        resendApiKey,
        emailFrom,
        adminNotificationEmail,
        companyName,
        companyAddress,
      }),
    });
    setSaving(false);
    setSaved(true);
    setStripeSecretKey("");
    setStripeWebhookSecret("");
    setPaypalClientSecret("");
    setResendApiKey("");
    router.refresh();
  }

  return (
    <div style={{ display: "grid", gap: 28, maxWidth: 520 }}>
      <div className="card" style={{ display: "grid", gap: 14 }}>
        <p className="eyebrow">Stripe — paiement par carte</p>
        <SecretField
          label="Clé secrète (sk_...)"
          placeholderWhenSet={props.stripeSecretKeySet}
          value={stripeSecretKey}
          onChange={setStripeSecretKey}
          help="Dashboard Stripe → Développeurs → Clés API"
        />
        <SecretField
          label="Secret de signature du webhook (whsec_...)"
          placeholderWhenSet={props.stripeWebhookSecretSet}
          value={stripeWebhookSecret}
          onChange={setStripeWebhookSecret}
          help="Dashboard Stripe → Développeurs → Webhooks → ton endpoint"
        />
      </div>

      <div className="card" style={{ display: "grid", gap: 14 }}>
        <p className="eyebrow">PayPal</p>
        <div>
          <label>Client ID</label>
          <input value={paypalClientId} onChange={(e) => setPaypalClientId(e.target.value)} placeholder="Non configuré" />
        </div>
        <SecretField
          label="Client Secret"
          placeholderWhenSet={props.paypalClientSecretSet}
          value={paypalClientSecret}
          onChange={setPaypalClientSecret}
        />
        <div>
          <label>Environnement</label>
          <select value={paypalEnv} onChange={(e) => setPaypalEnv(e.target.value)}>
            <option value="sandbox">Sandbox (test)</option>
            <option value="live">Live (réel)</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ display: "grid", gap: 14 }}>
        <p className="eyebrow">Emails (Resend)</p>
        <SecretField
          label="Clé API Resend (re_...)"
          placeholderWhenSet={props.resendApiKeySet}
          value={resendApiKey}
          onChange={setResendApiKey}
        />
        <div>
          <label>Adresse d'expédition des emails</label>
          <input type="email" value={emailFrom} onChange={(e) => setEmailFrom(e.target.value)} />
        </div>
        <div>
          <label>Email admin (notifié à chaque nouvelle commande)</label>
          <input type="email" value={adminNotificationEmail} onChange={(e) => setAdminNotificationEmail(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ display: "grid", gap: 14 }}>
        <p className="eyebrow">Société (affiché sur les factures)</p>
        <div>
          <label>Nom</label>
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>
        <div>
          <label>Adresse</label>
          <input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        {saved && <span style={{ color: "var(--success)", fontSize: 13 }}>✓ Enregistré</span>}
      </div>
    </div>
  );
}