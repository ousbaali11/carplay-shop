import AdminSidebar from "@/components/AdminSidebar";
import { requireAdminPage } from "@/lib/admin";
import IntegrationsSettingsForm from "@/components/IntegrationsSettingsForm";
import { getPaymentSettings, getSiteSettings } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminIntegrationsPage() {
  await requireAdminPage();
  const payment = await getPaymentSettings();
  const site = await getSiteSettings();

  return (
    <div className="admin-layout">
      <AdminSidebar active="integrations" />
      <div className="admin-main">
        <div className="page-header">
          <h1 className="page-title">Intégrations</h1>
          <p className="page-lead">
            Clés Stripe, PayPal, Resend et infos société. Les clés secrètes ne sont
            jamais réaffichées en clair une fois enregistrées — laisse le champ vide
            pour ne pas les changer.
          </p>
        </div>
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
