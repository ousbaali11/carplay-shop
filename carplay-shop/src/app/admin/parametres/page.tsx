import AdminSidebar from "@/components/AdminSidebar";
import PaymentSettingsForm from "@/components/PaymentSettingsForm";
import { getPaymentSettings } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminPaymentPage() {
  const settings = await getPaymentSettings();

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
            Chaque moyen de paiement supplémentaire (Mollie, Lyra/PayZen, Alma, Apple Pay,
            Google Pay...) nécessite sa propre configuration technique, distincte des autres.
            Ce n'est pas un réglage à activer simplement en cochant une case ici.
          </p>
        </div>
      </div>
    </div>
  );
}
