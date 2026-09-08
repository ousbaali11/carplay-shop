import sanitizeHtml from "sanitize-html";

// Échappe une chaîne destinée à être insérée dans du HTML (emails, etc.).
// Toute donnée saisie par un client (prénom, année du véhicule, message de
// contact...) DOIT passer par ici avant d'être concaténée dans un template.
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Nettoie le HTML produit par l'éditeur de description (Tiptap) avant de le
// stocker : seules les balises de mise en forme attendues sont conservées, et
// pour les <span> uniquement une couleur de texte. Tout script / handler /
// iframe / lien javascript: est supprimé. Le HTML stocké est ensuite affiché
// avec dangerouslySetInnerHTML : il doit donc être sûr dès l'enregistrement.
export function sanitizeRichText(input: string | null | undefined): string | null {
  if (!input) return null;
  const clean = sanitizeHtml(input, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "strike",
      "ul", "ol", "li", "h1", "h2", "h3", "h4", "blockquote", "code", "pre", "hr", "span",
    ],
    allowedAttributes: { span: ["style"] },
    allowedStyles: {
      span: { color: [/^#[0-9a-fA-F]{3,8}$/, /^rgba?\([\d\s,.%]+\)$/, /^[a-zA-Z]+$/] },
    },
    allowedSchemes: [],
    disallowedTagsMode: "discard",
  }).trim();
  // Un éditeur vide renvoie "<p></p>" : on considère ça comme "pas de description".
  if (!clean || /^(<p>\s*<\/p>\s*)+$/.test(clean)) return null;
  return clean;
}

// Accepte uniquement des URLs http(s) absolues (liens réglés par l'admin :
// Instagram, WhatsApp, vidéo, logo, liens Google Drive...). Refuse
// javascript:, data:, etc.
export function isSafeHttpUrl(value: unknown, maxLength = 2000): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Nettoie un nom de fichier avant de le mettre dans un en-tête
// Content-Disposition (pas de guillemets, retours à la ligne, caractères de contrôle).
export function safeFileName(name: string, fallback = "fichier.pdf"): string {
  const cleaned = name
    // eslint-disable-next-line no-control-regex
    .replace(/[\r\n"\\/\x00-\x1f\x7f]/g, "")
    .replace(/[^\x20-\x7e]/g, "_")
    .trim();
  return cleaned || fallback;
}
