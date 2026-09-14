"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteFileButton({ url, label = "Supprimer" }: { url: string; label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Supprimer ce fichier ?")) return;
    setLoading(true);
    const res = await fetch(url, { method: "DELETE" });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert("La suppression a échoué.");
  }

  return (
    <button type="button" onClick={handleDelete} disabled={loading} className="link-danger">
      {loading ? "..." : label}
    </button>
  );
}
