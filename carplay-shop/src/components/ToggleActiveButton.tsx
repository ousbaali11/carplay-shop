"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ToggleActiveButton({ vehicleId, active }: { vehicleId: string; active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/admin/vehicles/${vehicleId}/toggle-active`, { method: "POST" });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert("Le changement de statut a échoué.");
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`badge ${active ? "badge-paid" : "badge-canceled"}`}
      style={{ border: "none", cursor: "pointer" }}
      title="Cliquer pour changer"
    >
      {loading ? "..." : active ? "Visible" : "Masqué"}
    </button>
  );
}