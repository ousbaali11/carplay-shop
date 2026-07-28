"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroVideoSettingsForm({
  currentUrl,
  hasUploadedFile,
}: {
  currentUrl: string;
  hasUploadedFile: boolean;
}) {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState(currentUrl);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function saveUrl() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const formData = new FormData();
    formData.append("videoUrl", videoUrl);
    const res = await fetch("/api/admin/settings/hero-video", { method: "POST", body: formData });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Échec de l'enregistrement.");
    }
  }

  async function saveFile() {
    if (!file) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const formData = new FormData();
    formData.append("video", file);
    const res = await fetch("/api/admin/settings/hero-video", { method: "POST", body: formData });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setFile(null);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Échec de l'envoi.");
    }
  }

  async function removeVideo() {
    if (!confirm("Revenir à l'animation par défaut (supprime le lien et/ou le fichier) ?")) return;
    setSaving(true);
    const formData = new FormData();
    formData.append("remove", "true");
    await fetch("/api/admin/settings/hero-video", { method: "POST", body: formData });
    setSaving(false);
    setVideoUrl("");
    router.refresh();
  }

  return (
    <div className="card" style={{ display: "grid", gap: 20, maxWidth: 520 }}>
      <div>
        <p style={{ color: "var(--text)", fontWeight: 600, marginBottom: 4 }}>Option A — Lien vidéo externe (recommandé)</p>
        <p style={{ fontSize: 13, marginBottom: 10 }}>
          Héberge ta vidéo sur Cloudinary, YouTube (lien direct .mp4), ou tout autre
          service gratuit, puis colle le lien ici.
        </p>
        <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://.../ma-video.mp4" />
        <button className="btn btn-primary" onClick={saveUrl} disabled={saving} style={{ marginTop: 10 }}>
          {saving ? "..." : "Enregistrer ce lien"}
        </button>
      </div>

      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 18 }}>
        <p style={{ color: "var(--text)", fontWeight: 600, marginBottom: 4 }}>Option B — Envoyer un fichier directement</p>
        <p style={{ fontSize: 13, marginBottom: 10 }}>
          Vidéo courte et compressée uniquement (max ~4 Mo). Écrase l'option A si utilisée.
        </p>
        <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button className="btn btn-secondary" onClick={saveFile} disabled={saving || !file} style={{ marginTop: 10 }}>
          {saving ? "Envoi..." : "Envoyer ce fichier"}
        </button>
      </div>

      {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}
      {saved && <p style={{ color: "var(--success)", fontSize: 13 }}>✓ Enregistré</p>}

      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, fontSize: 13 }}>
        Statut actuel :{" "}
        {currentUrl ? "lien externe configuré" : hasUploadedFile ? "fichier uploadé" : "aucune vidéo (animation par défaut affichée)"}
        {(currentUrl || hasUploadedFile) && (
          <button onClick={removeVideo} className="btn btn-secondary" style={{ marginLeft: 12, padding: "4px 10px", fontSize: 12 }} disabled={saving}>
            Revenir à l'animation par défaut
          </button>
        )}
      </div>
    </div>
  );
}