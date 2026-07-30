"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("La confirmation ne correspond pas au mot de passe.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/compte/connexion"), 2000);
    } else {
      setError(data.error || "Une erreur est survenue.");
    }
  }

  if (!token) {
    return (
      <div className="card">
        <p style={{ color: "var(--danger)" }}>Lien invalide. Refais une demande de réinitialisation.</p>
        <p style={{ marginTop: 12 }}>
          <Link href="/compte/mot-de-passe-oublie" style={{ color: "var(--cyan)" }}>Mot de passe oublié</Link>
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card">
        <p style={{ color: "var(--success)", fontWeight: 600 }}>✓ Mot de passe mis à jour</p>
        <p style={{ fontSize: 14, marginTop: 8 }}>Redirection vers la connexion...</p>
      </div>
    );
  }

  return (
    <>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Nouveau mot de passe</h1>
      <form onSubmit={submit} className="card" style={{ display: "grid", gap: 14 }}>
        <div>
          <label>Nouveau mot de passe (8 caractères min.)</label>
          <PasswordInput required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label>Confirmer le mot de passe</label>
          <PasswordInput required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        {error && <p style={{ color: "var(--danger)", fontSize: 14 }}>{error}</p>}
        <button className="btn btn-primary" disabled={loading}>{loading ? "..." : "Réinitialiser mon mot de passe"}</button>
      </form>
    </>
  );
}
