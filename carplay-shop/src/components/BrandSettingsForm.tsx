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
    <div className="card form-card gap-20 w-480">
      <div className="brand-preview">
        <p className="preview-label">Aperçu</p>
        <SiteBrand siteName={siteName} logoUrl={logoUrl || null} logoHeight={logoHeight} />
      </div>

      <div>
        <label>Nom du site</label>
        <input value={siteName} onChange={(e) => setSiteName(e.target.value)} disabled={busy} />
      </div>

      <div>
        <label>Logo (image — laisse vide pour garder le logo par défaut)</label>
        <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" disabled={busy} onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
        {uploading && <p className="form-info mt-6">Envoi en cours...</p>}
        {logoUrl && (
          <button onClick={removeLogo} className="btn btn-secondary btn-sm mt-8" disabled={busy}>
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
          className="range-full"
        />
        <p className="field-hint">
          S'applique au logo uploadé comme au logo par défaut, partout sur le site.
        </p>
      </div>

      {error && <p className="form-error">{error}</p>}
      {saved && <p className="form-success">✓ Enregistré</p>}

      <button className="btn btn-primary self-start" onClick={() => save()} disabled={busy}>
        {saving ? "..." : "Enregistrer le nom"}
      </button>
    </div>
  );
}
