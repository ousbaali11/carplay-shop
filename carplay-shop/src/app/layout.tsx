import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { getSiteSettings } from "@/lib/orders";

export const metadata: Metadata = {
  title: "CarPlay Activation — Débloquez CarPlay & Android Auto",
  description:
    "Activez CarPlay et Android Auto sur votre véhicule. Fichiers d'activation + carte mémoire prête à l'emploi, livrés avec guide PDF pas à pas.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const theme = settings.theme && settings.theme !== "default" ? settings.theme : undefined;

  return (
    <html lang="fr" data-theme={theme}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}