import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "CarPlay Activation — Débloquez Apple CarPlay & Android Auto",
  description:
    "Activez Apple CarPlay et Android Auto sur votre véhicule. Fichiers d'activation + carte mémoire prête à l'emploi, livrés avec guide PDF pas à pas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
