"use client";

import { useState } from "react";
import PasswordInput from "@/components/PasswordInput";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }
    const signInRes = await signIn("credentials", { redirect: false, email: form.email, password: form.password });
    if (signInRes?.ok) {
      window.location.href = "/compte";
      return;
    }
    setLoading(false);
    router.push("/compte/connexion");
  }

  return (
    <>
      <h1 className="auth-heading">Créer un compte</h1>
      <form onSubmit={submit} className="card form-card auth-form">
        <div className="form-grid-2">
          <div>
            <label>Prénom</label>
            <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} autoComplete="given-name" />
          </div>
          <div>
            <label>Nom</label>
            <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} autoComplete="family-name" />
          </div>
        </div>
        <div>
          <label>Email</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
        </div>
        <div>
          <label>Téléphone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
        </div>
        <div>
          <label>Mot de passe (8 caractères minimum)</label>
          <PasswordInput required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
        </div>
        {error && <p className="form-error form-error-md">{error}</p>}
        <button className="btn btn-primary" disabled={loading}>{loading ? "Création..." : "Créer mon compte"}</button>
      </form>
      <p className="auth-links">
        Déjà un compte ? <Link href="/compte/connexion" className="link-inline">Se connecter</Link>
      </p>
      <p className="auth-links sm">
        Vous pouvez aussi <Link href="/#produits" className="link-inline">commander sans créer de compte</Link>.
      </p>
    </>
  );
}
