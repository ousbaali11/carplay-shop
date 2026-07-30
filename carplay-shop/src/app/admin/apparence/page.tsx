import AdminSidebar from "@/components/AdminSidebar";
import ContactSettingsForm from "@/components/ContactSettingsForm";
import HeroVideoSettingsForm from "@/components/HeroVideoSettingsForm";
import BrandSettingsForm from "@/components/BrandSettingsForm";
import InvoiceSettingsForm from "@/components/InvoiceSettingsForm";
import { getSiteSettings } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminApparencePage() {
  const settings = await getSiteSettings();

  return (
    <div className="admin-layout">
      <AdminSidebar active="apparence" />
      <div style={{ flex: 1, padding: "36px 40px" }}>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>Nom et logo du site</h1>
        <p style={{ marginBottom: 24, maxWidth: 480 }}>
          Affichés en haut de toutes les pages, publiques et admin.
        </p>
        <BrandSettingsForm currentSiteName={settings.siteName} currentLogoUrl={settings.logoUrl || ""} currentLogoHeight={settings.logoHeight} />

        <h1 style={{ fontSize: 26, margin: "40px 0 8px" }}>Vidéo de la page d'accueil</h1>
        <p style={{ marginBottom: 24, maxWidth: 520 }}>
          Remplace l'animation par défaut de l'accueil par ta propre vidéo.
        </p>
        <HeroVideoSettingsForm currentUrl={settings.heroVideoUrl || ""} />

        <h1 style={{ fontSize: 26, margin: "40px 0 8px" }}>Coordonnées de contact</h1>
        <p style={{ marginBottom: 24, maxWidth: 480 }}>
          Affichées dans la section "Contactez-nous" de la page d'accueil.
        </p>
        <ContactSettingsForm initialContactEmail={settings.contactEmail} initialInstagramUrl={settings.instagramUrl} initialWhatsappUrl={settings.whatsappUrl || ""} />

        <h1 style={{ fontSize: 26, margin: "40px 0 8px" }}>Facturation</h1>
        <p style={{ marginBottom: 24, maxWidth: 480 }}>
          Contrôle si les clients reçoivent une facture, pour les deux formules.
        </p>
        <InvoiceSettingsForm initialEnabled={settings.invoicesEnabled} />
      </div>
    </div>
  );
}