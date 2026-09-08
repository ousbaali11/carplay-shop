import { sanitizeRichText } from "@/lib/html";

// Validation des fichiers et des champs envoyés par les formulaires admin
// (véhicules, types d'activation). Tout est vérifié AVANT d'écrire en base :
// type réel du fichier (signature binaire, pas seulement l'extension), taille,
// prix numériques, HTML de description nettoyé.

export const MAX_PDF_BYTES = 25 * 1024 * 1024; // 25 Mo
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 Mo

export function parsePriceEur(raw: unknown): number | null {
  if (typeof raw !== "string") return null;
  const n = Number(raw.replace(",", ".").trim());
  if (!Number.isFinite(n) || n < 0 || n > 100000) return null;
  return Math.round(n * 100);
}

export function pickFiles(formData: FormData, field: string): File[] {
  return formData
    .getAll(field)
    .filter((v): v is File => typeof v === "object" && v !== null && typeof (v as File).arrayBuffer === "function" && (v as File).size > 0);
}

export function cleanFileName(name: string, fallback: string) {
  const base = (name || "").split(/[\\/]/).pop() || "";
  // Retire caractères de contrôle, guillemets et chevrons (en-têtes HTTP, HTML).
  // eslint-disable-next-line no-control-regex
  const cleaned = base.replace(/[\x00-\x1f\x7f"<>]/g, "").trim().slice(0, 150);
  return cleaned || fallback;
}

export async function readPdfUpload(file: File): Promise<{ buf: Buffer; fileName: string } | { error: string }> {
  if (file.size > MAX_PDF_BYTES) return { error: `"${file.name}" dépasse 25 Mo.` };
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return { error: `"${file.name}" n'est pas un PDF valide.` };
  }
  return { buf, fileName: cleanFileName(file.name, "guide.pdf") };
}

function sniffImageMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString("latin1") === "RIFF" && buf.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  const gif = buf.subarray(0, 6).toString("latin1");
  if (gif === "GIF87a" || gif === "GIF89a") return "image/gif";
  if (buf.subarray(4, 12).toString("latin1") === "ftypavif") return "image/avif";
  return null;
}

export async function readImageUpload(
  file: File
): Promise<{ buf: Buffer; mimeType: string; fileName: string } | { error: string }> {
  if (file.size > MAX_IMAGE_BYTES) return { error: `"${file.name}" dépasse 8 Mo.` };
  const buf = Buffer.from(await file.arrayBuffer());
  const mimeType = sniffImageMime(buf);
  if (!mimeType) return { error: `"${file.name}" n'est pas une image reconnue (JPEG, PNG, WebP, GIF, AVIF).` };
  return { buf, mimeType, fileName: cleanFileName(file.name, "photo") };
}

export type VehicleFormData = {
  title: string;
  description: string | null;
  priceFilesCents: number;
  pricePhysicalCents: number;
  active: boolean;
  activationTypeId: string | null;
};

export function parseVehicleForm(formData: FormData): { ok: true; data: VehicleFormData } | { ok: false; error: string } {
  const title = String(formData.get("title") ?? "").trim();
  if (!title || title.length > 200) return { ok: false, error: "Le titre est obligatoire (200 caractères max)." };

  const priceFilesCents = parsePriceEur(formData.get("priceFilesEur"));
  const pricePhysicalCents = parsePriceEur(formData.get("pricePhysicalEur"));
  if (priceFilesCents === null || pricePhysicalCents === null) {
    return { ok: false, error: "Prix invalide : saisis un nombre positif (ex: 29.90)." };
  }

  const rawDescription = String(formData.get("description") ?? "");
  if (rawDescription.length > 50000) return { ok: false, error: "La description est trop longue." };
  const description = sanitizeRichText(rawDescription);

  const active = formData.get("active") === "on";
  const activationTypeId = String(formData.get("activationTypeId") ?? "").trim() || null;
  if (activationTypeId && activationTypeId.length > 64) return { ok: false, error: "Type d'activation invalide." };

  return { ok: true, data: { title, description, priceFilesCents, pricePhysicalCents, active, activationTypeId } };
}
