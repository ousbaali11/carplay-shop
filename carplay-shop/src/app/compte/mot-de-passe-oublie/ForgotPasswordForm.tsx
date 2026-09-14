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
        <p className="form-title mb-8">Email envoyé</p>
        <p className="text-14">
          Si un compte existe avec l'adresse <b className="strong-text">{email}</b>, un lien de
          réinitialisation vient d'être envoyé (valable 1 heure). Vérifie aussi tes spams.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="auth-heading">Mot de passe oublié</h1>
      <form onSubmit={submit} className="card form-card auth-form">
        <div>
          <label>Email de ton compte</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
        </button>
      </form>
      <p className="auth-links">
        <Link href="/compte/connexion" className="link-inline">← Retour à la connexion</Link>
      </p>
    </>
  );
}
