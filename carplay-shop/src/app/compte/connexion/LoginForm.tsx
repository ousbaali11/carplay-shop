"use client";

import { useState } from "react";
import PasswordInput from "@/components/PasswordInput";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";

export default function LoginForm() {
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
      // Détecte le rôle du compte qui vient de se connecter : un compte admin
      // n'est jamais traité comme un compte client, il repart directement vers
      // le panel admin plutôt que vers l'espace client.
      const session = await getSession();
      const role = (session?.user as any)?.role;
      // Rechargement complet (au lieu d'une navigation "douce") pour garantir
      // que le nouveau cookie de session est bien pris en compte immédiatement.
      window.location.href = role === "ADMIN" ? "/admin" : "/compte";
      return;
    }
    setLoading(false);
    setError("Email ou mot de passe incorrect.");
  }

  return (
    <>
      <h1 className="auth-heading">Connexion</h1>
      <form onSubmit={submit} className="card form-card auth-form">
        <div>
          <label>Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div>
          <label>Mot de passe</label>
          <PasswordInput required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {error && <p className="form-error form-error-md">{error}</p>}
        <button className="btn btn-primary" disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>
      </form>
      <p className="auth-links">
        Pas encore de compte ? <Link href="/compte/inscription" className="link-inline">Créer un compte</Link>
        {" · "}
        <Link href="/compte/mot-de-passe-oublie" className="link-inline">Mot de passe oublié ?</Link>
      </p>
    </>
  );
}
