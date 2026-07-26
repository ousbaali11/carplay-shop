"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ShipOrderForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [tracking, setTracking] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/admin/orders/${orderId}/ship`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingNumber: tracking }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
      <div>
        <label>Numéro de suivi (optionnel)</label>
        <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="ex: 6A00012345678" />
      </div>
      <button className="btn btn-amber" disabled={loading}>
        {loading ? "Envoi..." : "Marquer comme expédiée et notifier le client"}
      </button>
    </form>
  );
}
