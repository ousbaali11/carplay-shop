import { customAlphabet } from "nanoid";

// Token long et aléatoire, imprévisible : c'est ce qui protège le PDF.
// Personne ne peut deviner/forcer une URL de téléchargement.
const tokenAlphabet =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const generateDownloadToken = customAlphabet(tokenAlphabet, 48);

const orderAlphabet = "0123456789";
const orderSuffix = customAlphabet(orderAlphabet, 6);
export function generateOrderNumber() {
  const year = new Date().getFullYear();
  return `CMD-${year}-${orderSuffix()}`;
}

// Le lien de téléchargement expire après 30 jours pour limiter le partage abusif.
export function downloadExpiryDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}

export const generateResetToken = customAlphabet(tokenAlphabet, 48);

// Le lien de réinitialisation de mot de passe expire après 1h (sensible : donne
// accès au compte).
export function resetTokenExpiryDate() {
  const d = new Date();
  d.setHours(d.getHours() + 1);
  return d;
}
