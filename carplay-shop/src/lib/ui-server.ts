import { cookies } from "next/headers";
import { getSiteSettings } from "@/lib/orders";
import { isValidInterfaceVersion, normalizeInterfaceVersion, type InterfaceVersion } from "@/lib/ui";

// Lecture du réglage d'interface côté serveur uniquement (layout racine, pages
// serveur qui adaptent leur rendu à l'interface effectivement affichée).

// Réglage global enregistré en base (ce que l'admin a choisi).
export async function getInterfaceVersion(): Promise<InterfaceVersion> {
  const settings = await getSiteSettings();
  return normalizeInterfaceVersion(settings.interfaceVersion);
}

// Prévisualisation locale uniquement (jamais en production) : la base étant
// partagée entre le dev local et le site en ligne, le cookie "ui-preview"
// permet de tester une interface sur localhost sans modifier le réglage
// global. Posé par /api/dev/ui. En production, ce cookie est ignoré.
export function devPreviewOverride(): InterfaceVersion | null {
  if (process.env.NODE_ENV === "production") return null;
  const value = cookies().get("ui-preview")?.value;
  return isValidInterfaceVersion(value) ? value : null;
}

// Interface EFFECTIVEMENT affichée : réglage global, ou prévisualisation
// locale en dev. C'est cette valeur que le layout pose sur <html data-ui>.
export function resolveEffectiveInterfaceVersion(stored: unknown): InterfaceVersion {
  return devPreviewOverride() ?? normalizeInterfaceVersion(stored);
}

export async function getEffectiveInterfaceVersion(): Promise<InterfaceVersion> {
  const settings = await getSiteSettings();
  return resolveEffectiveInterfaceVersion(settings.interfaceVersion);
}
