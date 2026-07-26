"use client";

import { useState } from "react";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("La confirmation ne correspond pas au nouveau mot de passe.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/account/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setError(data.error || "Une erreur est survenue.");
    }
  }

  return (
    <form onSubmit={submit} className="card" style={{ display: "grid", gap: 12, maxWidth: 380 }}>
      <div>
        <label>Mot de passe actuel</label>
        <input required type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      </div>
      <div>
        <label>Nouveau mot de passe (8 caractères min.)</label>
        <input required type="password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </div>
      <div>
        <label>Confirmer le nouveau mot de passe</label>
        <input required type="password" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </div>
      {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}
      {success && <p style={{ color: "var(--success)", fontSize: 13 }}>✓ Mot de passe mis à jour</p>}
      <button className="btn btn-primary" disabled={loading} style={{ justifySelf: "start" }}>
        {loading ? "Enregistrement..." : "Changer mon mot de passe"}
      </button>
    </form>
  );
}
