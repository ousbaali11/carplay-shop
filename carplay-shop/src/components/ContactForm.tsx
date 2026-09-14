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
      <div className="card w-480 mt-28">
        <p className="text-success strong">✓ Message envoyé</p>
        <p className="text-14 mt-6">Nous te répondrons dès que possible, à l'adresse indiquée.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card form-card w-480 mt-28">
      <p className="form-title">Ou écris-nous directement</p>
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
        <label>Téléphone (optionnel)</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
      </div>
      <div>
        <label>Objet</label>
        <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="ex: Question avant achat" />
      </div>
      <div>
        <label>Message</label>
        <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn-primary self-start" disabled={loading}>
        {loading ? "Envoi..." : "Envoyer le message"}
      </button>
    </form>
  );
}
