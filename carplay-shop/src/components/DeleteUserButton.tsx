"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteUserButton({ userId, label }: { userId: string; label: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Supprimer définitivement le compte de "${label}" ? Cette action est irréversible.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) router.refresh();
    else alert(data.error || "La suppression a échoué.");
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      style={{ background: "none", border: "none", color: "var(--danger)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
    >
      {loading ? "..." : "Supprimer"}
    </button>
  );
}
