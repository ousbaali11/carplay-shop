"use client";

import { useState } from "react";
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
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Créer un compte</h1>
      <form onSubmit={submit} className="card" style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label>Prénom</label>
            <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div>
            <label>Nom</label>
            <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
        </div>
        <div>
          <label>Email</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label>Téléphone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label>Mot de passe (8 caractères minimum)</label>
          <input required type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error && <p style={{ color: "var(--danger)", fontSize: 14 }}>{error}</p>}
        <button className="btn btn-primary" disabled={loading}>{loading ? "Création..." : "Créer mon compte"}</button>
        </form>
        <p style={{ marginTop: 16, fontSize: 14 }}>
          Déjà un compte ? <Link href="/compte/connexion" style={{ color: "var(--cyan)" }}>Se connecter</Link>
        </p>
      <p style={{ marginTop: 8, fontSize: 13 }}>
        Vous pouvez aussi <Link href="/#produits" style={{ color: "var(--cyan)" }}>commander sans créer de compte</Link>.
      </p>
    </>
  );
}