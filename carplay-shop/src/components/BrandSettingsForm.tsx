"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import SiteBrand from "./SiteBrand";

export default function BrandSettingsForm({
  currentSiteName,
  currentLogoUrl,
  currentLogoHeight,
}: {
  currentSiteName: string;
  currentLogoUrl: string;
  currentLogoHeight: number;
}) {
  const router = useRouter();
  const [siteName, setSiteName] = useState(currentSiteName);
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
  const [logoHeight, setLogoHeight] = useState(currentLogoHeight);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save(overrides: { logoUrl?: string | null; logoHeight?: number } = {}) {
    setSaving(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/admin/settings/brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteName,
        logoUrl: overrides.logoUrl !== undefined ? overrides.logoUrl : logoUrl,
        logoHeight: overrides.logoHeight !== undefined ? overrides.logoHeight : logoHeight,
        removeLogo: overrides.logoUrl === null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Échec de l'enregistrement.");
    }
  }

  async function handleLogoUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/logo-upload",
      });
      setLogoUrl(blob.url);
      await save({ logoUrl: blob.url });
    } catch (err: any) {
      setError(err.message || "Échec de l'envoi du logo.");
    } finally {
      setUploading(false);
    }
  }

  async function removeLogo() {
    setLogoUrl("");
    await save({ logoUrl: null });
  }

  const busy = uploading || saving;

  return (
    <div className="card" style={{ display: "grid", gap: 20, maxWidth: 480 }}>
      <div style={{ padding: 12, background: "var(--bg-elevated)", borderRadius: 8 }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Aperçu</p>
        <SiteBrand siteName={siteName} logoUrl={logoUrl || null} logoHeight={logoHeight} />
      </div>

      <div>
        <label>Nom du site</label>
        <input value={siteName} onChange={(e) => setSiteName(e.target.value)} disabled={busy} />
      </div>

      <div>
        <label>Logo (image — laisse vide pour garder le logo par défaut)</label>
        <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" disabled={busy} onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
        {uploading && <p style={{ fontSize: 13, color: "var(--cyan)", marginTop: 6 }}>Envoi en cours...</p>}
        {logoUrl && (
          <button onClick={removeLogo} className="btn btn-secondary" style={{ marginTop: 8, padding: "4px 10px", fontSize: 12 }} disabled={busy}>
            Revenir au logo par défaut
          </button>
        )}
      </div>

      <div>
        <label>Taille du logo ({logoHeight}px)</label>
        <input
          type="range"
          min={20}
          max={120}
          value={logoHeight}
          disabled={busy}
          onChange={(e) => setLogoHeight(Number(e.target.value))}
          onMouseUp={() => save()}
          onTouchEnd={() => save()}
          style={{ width: "100%" }}
        />
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          S'applique au logo uploadé comme au logo par défaut, partout sur le site.
        </p>
      </div>

      {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}
      {saved && <p style={{ color: "var(--success)", fontSize: 13 }}>✓ Enregistré</p>}

      <button className="btn btn-primary" onClick={() => save()} disabled={busy} style={{ justifySelf: "start" }}>
        {saving ? "..." : "Enregistrer le nom"}
      </button>
    </div>
  );
}
