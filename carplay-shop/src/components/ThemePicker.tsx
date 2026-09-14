"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { THEMES } from "@/lib/themes";

// disabled = interface Premium active : le thème de couleurs ne s'applique qu'en
// Standard, le sélecteur est donc affiché en lecture seule (le choix enregistré
// est conservé et réappliqué si l'admin repasse en Standard).
export default function ThemePicker({ currentTheme, disabled = false }: { currentTheme: string; disabled?: boolean }) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentTheme);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function selectTheme(key: string) {
    if (disabled) return;
    setSelected(key);
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: key }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className={disabled ? "picker-disabled" : undefined} aria-disabled={disabled}>
      <div className="picker-grid">
        {THEMES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => selectTheme(t.key)}
            disabled={saving || disabled}
            className={`card picker-option${selected === t.key ? " is-selected" : ""}`}
            aria-pressed={selected === t.key}
          >
            <div className="theme-swatches">
              <div className="theme-swatch" style={{ background: t.preview.bg }} />
              <div className="theme-swatch" style={{ background: t.preview.card }} />
              <div className="theme-swatch round" style={{ background: t.preview.primary }} />
              <div className="theme-swatch round" style={{ background: t.preview.secondary }} />
            </div>
            <p className="picker-title">
              {t.name} {selected === t.key ? "✓" : ""}
            </p>
            <p className="picker-desc">{t.description}</p>
          </button>
        ))}
      </div>
      {saved && <p className="form-success mt-14">✓ Thème appliqué sur tout le site.</p>}
    </div>
  );
}
