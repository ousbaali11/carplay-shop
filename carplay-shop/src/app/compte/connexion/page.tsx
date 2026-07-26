"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { signIn } from "next-auth/react";

export default function LoginPage() {
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
    setLoading(false);
    if (res?.ok) router.push("/compte");
    else setError("Email ou mot de passe incorrect.");
  }

  return (
    <>
      <Header />
      <section className="container" style={{ padding: "60px 0", maxWidth: 420 }}>
        <h1 style={{ fontSize: 26, marginBottom: 24 }}>Connexion</h1>
        <form onSubmit={submit} className="card" style={{ display: "grid", gap: 14 }}>
          <div>
            <label>Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label>Mot de passe</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p style={{ color: "var(--danger)", fontSize: 14 }}>{error}</p>}
          <button className="btn btn-primary" disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>
        </form>
        <p style={{ marginTop: 16, fontSize: 14 }}>
          Pas encore de compte ? <Link href="/compte/inscription" style={{ color: "var(--cyan)" }}>Créer un compte</Link>
        </p>
      </section>
      <Footer />
    </>
  );
}
