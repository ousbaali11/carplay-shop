// Interface du site, choisie par l'admin depuis /admin/apparence :
// - "standard" : le design d'origine (globals.css + thèmes de couleurs data-theme)
// - "premium"  : refonte visuelle complète (premium.css, activée par data-ui="premium"
//                sur <html>). Le thème de couleurs est ignoré dans ce mode.
//
// Ce module est PUR (aucun accès base) : importable côté client comme côté
// serveur. La lecture du réglage en base est dans src/lib/ui-server.ts.
// Aucune logique métier ne dépend de cette valeur : elle ne pilote que le rendu.
export type InterfaceVersion = "standard" | "premium";

export const INTERFACE_VERSIONS: { key: InterfaceVersion; name: string; description: string }[] = [
  {
    key: "standard",
    name: "Standard",
    description: "Le design d'origine du site, avec le choix du thème de couleurs ci-dessous.",
  },
  {
    key: "premium",
    name: "Premium",
    description: "Interface claire et professionnelle : hiérarchie, typographie, formulaires et tableaux retravaillés.",
  },
];

export function isValidInterfaceVersion(value: unknown): value is InterfaceVersion {
  return value === "standard" || value === "premium";
}

export function normalizeInterfaceVersion(value: unknown): InterfaceVersion {
  return value === "premium" ? "premium" : "standard";
}

// Thème de couleurs à poser sur <html data-theme> : uniquement en interface
// Standard et hors thème "default". En Premium, TOUJOURS undefined (la palette
// Premium est fixe, le réglage SiteSettings.theme est conservé mais ignoré).
export function resolveTheme(ui: InterfaceVersion, theme: string | null | undefined): string | undefined {
  if (ui !== "standard") return undefined;
  if (!theme || theme === "default") return undefined;
  return theme;
}
