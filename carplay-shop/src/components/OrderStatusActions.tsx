"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ACTIONS: { status: string; label: string; cls: string }[] = [
  { status: "PREPARING", label: "En préparation", cls: "btn-secondary" },
  { status: "SHIPPED", label: "Expédiée", cls: "btn-secondary" },
  { status: "CANCELED", label: "Annulée", cls: "btn-secondary" },
  { status: "REFUNDED", label: "Remboursée", cls: "btn-secondary" },
];

export default function OrderStatusActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function setStatus(newStatus: string, label: string) {
    if (newStatus === status) return;
    if (!confirm(`Changer le statut de cette commande vers "${label}" ?`)) return;
    setLoading(newStatus);
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
    else alert("Le changement de statut a échoué.");
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <label style={{ fontSize: 13 }}>Changer le statut de la commande (à tout moment, quel que soit l'état actuel)</label>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {ACTIONS.map((a) => (
          <button
            key={a.status}
            className={`btn ${a.cls}`}
            disabled={loading !== null || status === a.status}
            onClick={() => setStatus(a.status, a.label)}
            style={status === a.status ? { borderColor: "var(--cyan)", color: "var(--cyan)" } : undefined}
          >
            {loading === a.status ? "..." : status === a.status ? `✓ ${a.label}` : a.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
        Ce changement est silencieux (aucun email envoyé au client), sauf "Expédiée" via le
        formulaire "Expédition" ci-dessus qui, lui, notifie le client avec le numéro de suivi.
      </p>
    </div>
  );
}
