import AdminSidebar from "@/components/AdminSidebar";
import IntegrationsSettingsForm from "@/components/IntegrationsSettingsForm";
import { getSettings } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminIntegrationsPage() {
  const settings = await getSettings();

  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar active="integrations" />
      <div style={{ flex: 1, padding: "36px 40px" }}>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>Intégrations</h1>
        <p style={{ marginBottom: 24, maxWidth: 520 }}>
          Clés Stripe, PayPal, Resend et infos société. Les clés secrètes ne sont
          jamais réaffichées en clair une fois enregistrées — laisse le champ vide
          pour ne pas les changer.
        </p>
        <IntegrationsSettingsForm
          stripeSecretKeySet={!!settings.stripeSecretKey}
          stripeWebhookSecretSet={!!settings.stripeWebhookSecret}
          paypalClientId={settings.paypalClientId || ""}
          paypalClientSecretSet={!!settings.paypalClientSecret}
          paypalEnv={settings.paypalEnv}
          resendApiKeySet={!!settings.resendApiKey}
          emailFrom={settings.emailFrom}
          adminNotificationEmail={settings.adminNotificationEmail || ""}
          companyName={settings.companyName}
          companyAddress={settings.companyAddress || ""}
        />
      </div>
    </div>
  );
}