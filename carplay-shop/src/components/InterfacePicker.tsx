"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INTERFACE_VERSIONS, type InterfaceVersion } from "@/lib/ui";

// Sélecteur Standard / Premium dans /admin/apparence. Le changement est
// appliqué immédiatement sur tout le site (le layout racine relit le réglage).
export default function InterfacePicker({ current }: { current: InterfaceVersion }) {
  const router = useRouter();
  const [selected, setSelected] = useState<InterfaceVersion>(current);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function select(key: InterfaceVersion) {
    if (key === selected || saving) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    const res = await fetch("/api/admin/settings/interface", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interfaceVersion: key }),
    });
    setSaving(false);
    if (res.ok) {
      setSelected(key);
      setSaved(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Échec de l'enregistrement.");
    }
  }

  return (
    <div>
      <div className="picker-grid">
        {INTERFACE_VERSIONS.map((v) => {
          const active = selected === v.key;
          return (
            <button
              key={v.key}
              type="button"
              onClick={() => select(v.key)}
              disabled={saving}
              className={`card picker-option${active ? " is-selected" : ""}`}
              aria-pressed={active}
            >
              <div className={`picker-preview picker-preview-${v.key}`} aria-hidden="true">
                <span className="picker-preview-bar" />
                <span className="picker-preview-block" />
                <span className="picker-preview-line" />
                <span className="picker-preview-line short" />
                <span className="picker-preview-btn" />
              </div>
              <p className="picker-title">
                {v.name} {active ? "✓" : ""}
              </p>
              <p className="picker-desc">{v.description}</p>
            </button>
          );
        })}
      </div>
      {error && <p className="form-error mt-14">{error}</p>}
      {saved && <p className="form-success mt-14">✓ Interface appliquée sur tout le site.</p>}
    </div>
  );
}
