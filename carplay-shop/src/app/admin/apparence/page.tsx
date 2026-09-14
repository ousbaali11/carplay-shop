import AdminSidebar from "@/components/AdminSidebar";
import { requireAdminPage } from "@/lib/admin";
import ContactSettingsForm from "@/components/ContactSettingsForm";
import HeroVideoSettingsForm from "@/components/HeroVideoSettingsForm";
import BrandSettingsForm from "@/components/BrandSettingsForm";
import InvoiceSettingsForm from "@/components/InvoiceSettingsForm";
import ThemePicker from "@/components/ThemePicker";
import InterfacePicker from "@/components/InterfacePicker";
import { getSiteSettings } from "@/lib/orders";
import { normalizeInterfaceVersion } from "@/lib/ui";
import { resolveEffectiveInterfaceVersion } from "@/lib/ui-server";

export const dynamic = "force-dynamic";

export default async function AdminApparencePage() {
  await requireAdminPage();
  const settings = await getSiteSettings();
  // Réglage enregistré (ce que le sélecteur affiche comme choix courant)...
  const storedUi = normalizeInterfaceVersion(settings.interfaceVersion);
  // ...et interface effectivement affichée (identique, sauf prévisualisation locale en dev).
  const effectiveUi = resolveEffectiveInterfaceVersion(settings.interfaceVersion);
  const themeLocked = effectiveUi === "premium";

  return (
    <div className="admin-layout">
      <AdminSidebar active="apparence" />
      <div className="admin-main">
        <div className="page-header">
          <h1 className="page-title">Interface du site</h1>
          <p className="page-lead">
            Choisis le design de tout le site : pages publiques, tunnel de paiement, espace client et panel admin.
            Le changement est immédiat, sans aucun impact sur les commandes ou les réglages.
          </p>
        </div>
        <InterfacePicker current={storedUi} />

        <div className="page-header section-gap">
          <h1 className="page-title">Nom et logo du site</h1>
          <p className="page-lead">Affichés en haut de toutes les pages, publiques et admin.</p>
        </div>
        <BrandSettingsForm currentSiteName={settings.siteName} currentLogoUrl={settings.logoUrl || ""} currentLogoHeight={settings.logoHeight} />

        <div className="page-header section-gap">
          <h1 className="page-title">Vidéo de la page d'accueil</h1>
          <p className="page-lead">Remplace l'animation par défaut de l'accueil par ta propre vidéo.</p>
        </div>
        <HeroVideoSettingsForm currentUrl={settings.heroVideoUrl || ""} />

        <div className="page-header section-gap">
          <h1 className="page-title">Coordonnées de contact</h1>
          <p className="page-lead">Affichées dans la section "Contactez-nous" de la page d'accueil.</p>
        </div>
        <ContactSettingsForm initialContactEmail={settings.contactEmail} initialInstagramUrl={settings.instagramUrl} initialWhatsappUrl={settings.whatsappUrl || ""} />

        <div className="page-header section-gap">
          <h1 className="page-title">Facturation</h1>
          <p className="page-lead">Contrôle si les clients reçoivent une facture, pour les deux formules.</p>
        </div>
        <InvoiceSettingsForm initialEnabled={settings.invoicesEnabled} />

        <div className="page-header section-gap">
          <h1 className="page-title">Thème de couleurs</h1>
          <p className="page-lead">
            {themeLocked
              ? "Réservé à l'interface Standard : l'interface Premium utilise sa propre palette. Le thème enregistré est conservé et sera réappliqué si tu repasses en Standard."
              : "Change les couleurs de tout le site en un clic (accueil, panel admin, emails non compris)."}
          </p>
        </div>
        <ThemePicker currentTheme={settings.theme} disabled={themeLocked} />
      </div>
    </div>
  );
}
