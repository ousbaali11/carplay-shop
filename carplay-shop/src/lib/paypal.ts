import { prisma } from "@/lib/prisma";

async function getPaypalConfig() {
  const settings = await prisma.paymentSettings.findUnique({ where: { id: "singleton" } });
  if (!settings?.paypalClientId || !settings?.paypalClientSecret) return null;
  return {
    clientId: settings.paypalClientId,
    clientSecret: settings.paypalClientSecret,
    base: settings.paypalEnv === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com",
  };
}

async function getAccessToken(clientId: string, clientSecret: string, base: string) {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token as string;
}

// Crée une commande PayPal pour le montant de la commande interne.
// Renvoie null si PayPal n'est pas configuré.
export async function createPaypalOrder(amountEur: number, orderNumber: string) {
  const config = await getPaypalConfig();
  if (!config) return null;

  const accessToken = await getAccessToken(config.clientId, config.clientSecret, config.base);
  const res = await fetch(`${config.base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: orderNumber,
          amount: { currency_code: "EUR", value: amountEur.toFixed(2) },
        },
      ],
    }),
  });
  return res.json();
}

// Capture le paiement une fois que le client a validé sur PayPal.
export async function capturePaypalOrder(paypalOrderId: string) {
  const config = await getPaypalConfig();
  if (!config) return null;

  const accessToken = await getAccessToken(config.clientId, config.clientSecret, config.base);
  const res = await fetch(`${config.base}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  return res.json();
}