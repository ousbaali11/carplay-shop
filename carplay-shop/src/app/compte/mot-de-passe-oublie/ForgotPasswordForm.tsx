"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="card">
        <p style={{ color: "var(--text)", fontWeight: 600, marginBottom: 8 }}>Email envoyé</p>
        <p style={{ fontSize: 14 }}>
          Si un compte existe avec l'adresse <b style={{ color: "var(--text)" }}>{email}</b>, un lien de
          réinitialisation vient d'être envoyé (valable 1 heure). Vérifie aussi tes spams.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Mot de passe oublié</h1>
      <form onSubmit={submit} className="card" style={{ display: "grid", gap: 14 }}>
        <div>
          <label>Email de ton compte</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: 14 }}>
        <Link href="/compte/connexion" style={{ color: "var(--cyan)" }}>← Retour à la connexion</Link>
      </p>
    </>
  );
}
