"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteVehicleButton({ vehicleId, label }: { vehicleId: string; label: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Supprimer définitivement "${label}" du catalogue ? Cette action est irréversible.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/vehicles/${vehicleId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      router.push("/admin/vehicules");
      router.refresh();
    } else {
      alert("La suppression a échoué.");
    }
  }

  return (
    <button type="button" onClick={handleDelete} disabled={loading} className="btn btn-secondary" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
      {loading ? "Suppression..." : "Supprimer ce véhicule"}
    </button>
  );
}
