"use client";

import { useState } from "react";
import PasswordInput from "@/components/PasswordInput";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { redirect: false, email, password });
    if (res?.ok) {
      window.location.href = "/admin";
      return;
    }
    setLoading(false);
    setError("Identifiants incorrects.");
  }

  return (
    <div className="auth-screen">
      <form onSubmit={submit} className="card auth-card">
        <p className="eyebrow auth-eyebrow">Espace réservé</p>
        <h1 className="auth-title">Administration</h1>
        <div>
          <label>Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        </div>
        <div>
          <label>Mot de passe</label>
          <PasswordInput required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {error && <p className="form-error form-error-md">{error}</p>}
        <button className="btn btn-primary" disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>
      </form>
    </div>
  );
}
