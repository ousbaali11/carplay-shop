import AdminSidebar from "@/components/AdminSidebar";
import PaymentSettingsForm from "@/components/PaymentSettingsForm";
import ContactSettingsForm from "@/components/ContactSettingsForm";
import { getSettings } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="admin-layout">
      <AdminSidebar active="parametres" />
      <div style={{ flex: 1, padding: "36px 40px" }}>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>Moyens de paiement</h1>
        <p style={{ marginBottom: 24, maxWidth: 480 }}>
          Active ou désactive chaque moyen de paiement à tout moment. Le changement
          est immédiat sur le site.
        </p>
        <PaymentSettingsForm initialStripeEnabled={settings.stripeEnabled} initialPaypalEnabled={settings.paypalEnabled} />

        <div className="card" style={{ maxWidth: 480, marginTop: 24 }}>
          <p className="eyebrow" style={{ marginBottom: 10 }}>Ajouter un autre moyen de paiement</p>
          <p style={{ fontSize: 13 }}>
            Chaque moyen de paiement (Mollie, Lyra/PayZen, Alma, Apple Pay, Google Pay...)
            nécessite sa propre intégration technique — ce n'est pas un réglage à cocher.
            Dis-moi lequel tu veux ajouter et je le développe. À savoir : Stripe permet déjà
            d'activer Apple Pay, Google Pay et d'autres moyens directement depuis son
            tableau de bord, sans code supplémentaire.
          </p>
        </div>

        <h1 style={{ fontSize: 26, margin: "40px 0 8px" }}>Coordonnées de contact</h1>
        <p style={{ marginBottom: 24, maxWidth: 480 }}>
          Affichées dans la section "Contactez-nous" de la page d'accueil. Modifiable
          à tout moment, sans toucher au code.
        </p>
        <ContactSettingsForm initialContactEmail={settings.contactEmail} initialInstagramUrl={settings.instagramUrl} />
      </div>
    </div>
  );
}