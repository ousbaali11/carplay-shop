import AdminSidebar from "@/components/AdminSidebar";
import IntegrationsSettingsForm from "@/components/IntegrationsSettingsForm";
import { getPaymentSettings, getSiteSettings } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminIntegrationsPage() {
  const payment = await getPaymentSettings();
  const site = await getSiteSettings();

  return (
    <div className="admin-layout">
      <AdminSidebar active="integrations" />
      <div style={{ flex: 1, padding: "36px 40px" }}>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>Intégrations</h1>
        <p style={{ marginBottom: 24, maxWidth: 520 }}>
          Clés Stripe, PayPal, Resend et infos société. Les clés secrètes ne sont
          jamais réaffichées en clair une fois enregistrées — laisse le champ vide
          pour ne pas les changer.
        </p>
        <IntegrationsSettingsForm
          stripeSecretKeySet={!!payment.stripeSecretKey}
          stripeWebhookSecretSet={!!payment.stripeWebhookSecret}
          paypalClientId={payment.paypalClientId || ""}
          paypalClientSecretSet={!!payment.paypalClientSecret}
          paypalEnv={payment.paypalEnv}
          resendApiKeySet={!!site.resendApiKey}
          emailFrom={site.emailFrom}
          adminNotificationEmail={site.adminNotificationEmail || ""}
          companyName={site.companyName}
          companyAddress={site.companyAddress || ""}
        />
      </div>
    </div>
  );
}
