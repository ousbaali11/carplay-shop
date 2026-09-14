import AdminSidebar from "@/components/AdminSidebar";
import { requireAdminPage } from "@/lib/admin";
import PaymentSettingsForm from "@/components/PaymentSettingsForm";
import { getPaymentSettings } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminPaymentPage() {
  await requireAdminPage();
  const settings = await getPaymentSettings();

  return (
    <div className="admin-layout">
      <AdminSidebar active="parametres" />
      <div className="admin-main">
        <div className="page-header">
          <h1 className="page-title">Moyens de paiement</h1>
          <p className="page-lead w-480">
            Active ou désactive chaque moyen de paiement à tout moment. Le changement
            est immédiat sur le site.
          </p>
        </div>
        <PaymentSettingsForm initialStripeEnabled={settings.stripeEnabled} initialPaypalEnabled={settings.paypalEnabled} />

        <div className="card w-480 mt-24 info-card">
          <p className="eyebrow mb-10">Ajouter un autre moyen de paiement</p>
          <p className="note-text">
            Chaque moyen de paiement supplémentaire (Mollie, Lyra/PayZen, Alma, Apple Pay,
            Google Pay...) nécessite sa propre configuration technique, distincte des autres.
            Ce n'est pas un réglage à activer simplement en cochant une case ici.
          </p>
        </div>
      </div>
    </div>
  );
}
