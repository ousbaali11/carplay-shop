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
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Connexion</h1>
      <form onSubmit={submit} className="card" style={{ display: "grid", gap: 14 }}>
        <div>
          <label>Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Mot de passe</label>
          <PasswordInput required  value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p style={{ color: "var(--danger)", fontSize: 14 }}>{error}</p>}
        <button className="btn btn-primary" disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>
      </form>
      <p style={{ marginTop: 16, fontSize: 14 }}>
        Pas encore de compte ? <Link href="/compte/inscription" style={{ color: "var(--cyan)" }}>Créer un compte</Link>
        {" · "}
        <Link href="/compte/mot-de-passe-oublie" style={{ color: "var(--cyan)" }}>Mot de passe oublié ?</Link>
      </p>
    </>
  );
}
