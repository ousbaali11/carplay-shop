"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OPTIONS: { value: string; label: string }[] = [
  { value: "PENDING_PAYMENT", label: "En attente" },
  { value: "PAID", label: "Payée" },
  { value: "PREPARING", label: "En préparation" },
  { value: "SHIPPED", label: "Expédiée" },
  { value: "COMPLETED", label: "Terminée" },
  { value: "CANCELED", label: "Annulée" },
  { value: "REFUNDED", label: "Remboursée" },
];

// Classe de couleur (badge) correspondant à chaque statut, utilisée en Premium
// pour colorer le sélecteur comme un badge. Sans effet en Standard.
const TONE: Record<string, string> = {
  PENDING_PAYMENT: "tone-pending",
  PAID: "tone-paid",
  PREPARING: "tone-pending",
  SHIPPED: "tone-shipped",
  COMPLETED: "tone-paid",
  CANCELED: "tone-canceled",
  REFUNDED: "tone-canceled",
};

// Changement de statut directement depuis la ligne du tableau, sans ouvrir le
// détail de la commande. Le changement est immédiatement visible côté client
// (même colonne "status" en base, lue en direct par /compte).
export default function InlineStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function change(newStatus: string) {
    if (newStatus === status) return;
    const label = OPTIONS.find((o) => o.value === newStatus)?.label || newStatus;
    if (!confirm(`Changer le statut de cette commande vers "${label}" ?`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert("Le changement de statut a échoué.");
  }

  return (
    <select
      value={status}
      disabled={loading}
      onChange={(e) => change(e.target.value)}
      className={`select-inline ${TONE[status] || ""}`}
      aria-label="Changer le statut de la commande"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
