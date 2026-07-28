"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

export default function HeroVideoSettingsForm({ currentUrl }: { currentUrl: string }) {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function persistUrl(url: string | null) {
    setSaving(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/admin/settings/hero-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(url ? { videoUrl: url } : { remove: true }),
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

  async function handleFileUpload(file: File) {
    setUploading(true);
    setError(null);
    setSaved(false);
    setProgress(0);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/hero-video-upload",
        onUploadProgress: (p) => setProgress(Math.round(p.percentage)),
      });
      setVideoUrl(blob.url);
      await persistUrl(blob.url);
    } catch (err: any) {
      setError(err.message || "Échec de l'envoi (vérifie que la vidéo fait moins de 30 Mo).");
    } finally {
      setUploading(false);
    }
  }

  async function removeVideo() {
    if (!confirm("Revenir à l'animation par défaut ?")) return;
    setVideoUrl("");
    await persistUrl(null);
  }

  const busy = uploading || saving;

  return (
    <div className="card" style={{ display: "grid", gap: 20, maxWidth: 520 }}>
      <div>
        <p style={{ color: "var(--text)", fontWeight: 600, marginBottom: 4 }}>Envoyer un fichier (jusqu'à 30 Mo)</p>
        <p style={{ fontSize: 13, marginBottom: 10 }}>
          Le fichier est envoyé directement, sans passer par le code du site — donc
          pas de limite de 4 Mo ici.
        </p>
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          disabled={busy}
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        />
        {uploading && <p style={{ fontSize: 13, color: "var(--cyan)", marginTop: 8 }}>Envoi en cours... {progress}%</p>}
      </div>

      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 18 }}>
        <p style={{ color: "var(--text)", fontWeight: 600, marginBottom: 4 }}>Ou coller un lien externe</p>
        <p style={{ fontSize: 13, marginBottom: 10 }}>
          Vidéo déjà hébergée ailleurs (Cloudinary, lien direct .mp4, etc.).
        </p>
        <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://.../ma-video.mp4" disabled={busy} />
        <button className="btn btn-primary" onClick={() => persistUrl(videoUrl)} disabled={busy || !videoUrl.trim()} style={{ marginTop: 10 }}>
          {saving ? "..." : "Enregistrer ce lien"}
        </button>
      </div>

      {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}
      {saved && <p style={{ color: "var(--success)", fontSize: 13 }}>✓ Enregistré</p>}

      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, fontSize: 13 }}>
        Statut actuel : {currentUrl ? "vidéo configurée" : "aucune vidéo (animation par défaut affichée)"}
        {currentUrl && (
          <button onClick={removeVideo} className="btn btn-secondary" style={{ marginLeft: 12, padding: "4px 10px", fontSize: 12 }} disabled={busy}>
            Revenir à l'animation par défaut
          </button>
        )}
      </div>
    </div>
  );
}