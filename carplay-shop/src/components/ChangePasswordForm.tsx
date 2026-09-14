"use client";

import { useState } from "react";
import PasswordInput from "@/components/PasswordInput";

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
    <form onSubmit={submit} className="card form-card gap-12 w-380">
      <div>
        <label>Mot de passe actuel</label>
        <PasswordInput required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
      </div>
      <div>
        <label>Nouveau mot de passe (8 caractères min.)</label>
        <PasswordInput required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
      </div>
      <div>
        <label>Confirmer le nouveau mot de passe</label>
        <PasswordInput required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
      </div>
      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">✓ Mot de passe mis à jour</p>}
      <button className="btn btn-primary self-start" disabled={loading}>
        {loading ? "Enregistrement..." : "Changer mon mot de passe"}
      </button>
    </form>
  );
}
