export type ThemeDef = {
  key: string;
  name: string;
  description: string;
  preview: { bg: string; card: string; primary: string; secondary: string };
};

// Chaque thème redéfinit un jeu de couleurs (fond, cartes, texte, accents).
// "default" n'a besoin d'aucune règle CSS supplémentaire : il utilise les
// couleurs actuelles du site telles quelles.
export const THEMES: ThemeDef[] = [
  {
    key: "default",
    name: "Thème par défaut",
    description: "Le thème actuel du site : cyan et ambre sur fond sombre.",
    preview: { bg: "#0d1013", card: "#12161a", primary: "#00c2ce", secondary: "#f0a93a" },
  },
  {
    key: "android-auto",
    name: "Android Auto",
    description: "Vert Android, pour rappeler la compatibilité Android Auto.",
    preview: { bg: "#0b1210", card: "#10201a", primary: "#3ddc84", secondary: "#a8e063" },
  },
  {
    key: "atelier",
    name: "Atelier mécanicien",
    description: "Ambre chaud sur fond gris foncé, esprit garage.",
    preview: { bg: "#16130f", card: "#1f1a12", primary: "#f0a93a", secondary: "#ff8c42" },
  },
  {
    key: "obd-scanner",
    name: "Scanner OBD2",
    description: "Turquoise façon écran de valise de diagnostic automobile.",
    preview: { bg: "#060b0d", card: "#0c1417", primary: "#00e5c0", secondary: "#7fffd4" },
  },
  {
    key: "mode-sport",
    name: "Mode Sport",
    description: "Rouge intense, esprit voiture de sport.",
    preview: { bg: "#0d0808", card: "#170e0e", primary: "#ff3b3b", secondary: "#ff8080" },
  },
  {
    key: "premium",
    name: "Tableau de bord Premium",
    description: "Bleu nuit et or, esprit berline haut de gamme.",
    preview: { bg: "#0a0e16", card: "#101625", primary: "#4a6fa5", secondary: "#d4af6a" },
  },
  {
    key: "habitacle-nuit",
    name: "Habitacle de nuit",
    description: "Violet, façon éclairage d'ambiance intérieur.",
    preview: { bg: "#0f0a16", card: "#181025", primary: "#a78bfa", secondary: "#f472b6" },
  },
  {
    key: "jour-clair",
    name: "Jour clair",
    description: "Thème clair, fond blanc — pour ceux qui préfèrent.",
    preview: { bg: "#f5f6f8", card: "#ffffff", primary: "#0089a8", secondary: "#c97a1a" },
  },
  {
    key: "signal-warning",
    name: "Signal d'alerte",
    description: "Ambre vif, esprit voyant de tableau de bord.",
    preview: { bg: "#120e08", card: "#1c1509", primary: "#ffb020", secondary: "#ff5c5c" },
  },
  {
    key: "circuit",
    name: "Circuit imprimé",
    description: "Vert matrix sur noir, esprit électronique.",
    preview: { bg: "#060806", card: "#0d120d", primary: "#39ff14", secondary: "#00c2ce" },
  },
];

export function isValidTheme(key: string): boolean {
  return THEMES.some((t) => t.key === key);
}