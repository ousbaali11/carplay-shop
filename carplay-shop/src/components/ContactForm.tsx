"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Échec de l'envoi. Réessaie ou contacte-nous directement par email.");
    }
  }

  if (sent) {
    return (
      <div className="card" style={{ maxWidth: 480, marginTop: 28 }}>
        <p style={{ color: "var(--success)", fontWeight: 600 }}>✓ Message envoyé</p>
        <p style={{ fontSize: 14, marginTop: 6 }}>Nous te répondrons dès que possible, à l'adresse indiquée.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card" style={{ maxWidth: 480, marginTop: 28, display: "grid", gap: 14 }}>
      <p style={{ color: "var(--text)", fontWeight: 600 }}>Ou écris-nous directement</p>
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
        <label>Téléphone (optionnel)</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div>
        <label>Objet</label>
        <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="ex: Question avant achat" />
      </div>
      <div>
        <label>Message</label>
        <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </div>
      {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}
      <button className="btn btn-primary" disabled={loading} style={{ justifySelf: "start" }}>
        {loading ? "Envoi..." : "Envoyer le message"}
      </button>
    </form>
  );
}
