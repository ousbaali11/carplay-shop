"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { THEMES } from "@/lib/themes";

export default function ThemePicker({ currentTheme }: { currentTheme: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentTheme);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function selectTheme(key: string) {
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
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
        {THEMES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => selectTheme(t.key)}
            disabled={saving}
            className="card"
            style={{
              textAlign: "left",
              cursor: "pointer",
              padding: 14,
              borderColor: selected === t.key ? "var(--cyan)" : undefined,
              borderWidth: selected === t.key ? 2 : 1,
            }}
          >
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: t.preview.bg, border: "1px solid var(--line)" }} />
              <div style={{ width: 24, height: 24, borderRadius: 6, background: t.preview.card, border: "1px solid var(--line)" }} />
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: t.preview.primary }} />
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: t.preview.secondary }} />
            </div>
            <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
              {t.name} {selected === t.key ? "✓" : ""}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.description}</p>
          </button>
        ))}
      </div>
      {saved && <p style={{ color: "var(--success)", fontSize: 13, marginTop: 14 }}>✓ Thème appliqué sur tout le site.</p>}
    </div>
  );
}