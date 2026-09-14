import type { Metadata } from "next";
import "./globals.css";
import "./premium.css";
import Providers from "@/components/Providers";
import { getSiteSettings } from "@/lib/orders";
import { resolveTheme } from "@/lib/ui";
import { resolveEffectiveInterfaceVersion } from "@/lib/ui-server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "CarPlay Activation — Débloquez CarPlay & Android Auto",
  description:
    "Activez CarPlay et Android Auto sur votre véhicule. Fichiers d'activation + carte mémoire prête à l'emploi, livrés avec guide PDF pas à pas.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, session] = await Promise.all([getSiteSettings(), getServerSession(authOptions)]);
  // Interface affichée : réglage global (admin), ou prévisualisation locale en
  // dev via le cookie "ui-preview" (ignoré en production, voir src/lib/ui-server.ts).
  const ui = resolveEffectiveInterfaceVersion(settings.interfaceVersion);
  // En Premium, le thème de couleurs n'est jamais appliqué : premium.css définit
  // sa propre palette. En Standard, comportement d'origine inchangé.
  const theme = resolveTheme(ui, settings.theme);

  return (
    <html lang="fr" data-theme={theme} data-ui={ui === "premium" ? "premium" : undefined}>
      <body>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
