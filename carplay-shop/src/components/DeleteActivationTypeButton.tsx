"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteActivationTypeButton({ activationTypeId, label }: { activationTypeId: string; label: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Supprimer définitivement le type d'activation "${label}" ? Cette action est irréversible.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/activation-types/${activationTypeId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      router.push("/admin/activations");
      router.refresh();
    } else {
      alert("La suppression a échoué.");
    }
  }

  return (
    <button type="button" onClick={handleDelete} disabled={loading} className="btn btn-secondary" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
      {loading ? "Suppression..." : "Supprimer ce type d'activation"}
    </button>
  );
}
