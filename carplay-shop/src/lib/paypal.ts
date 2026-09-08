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
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(`PayPal : impossible d'obtenir un jeton d'accès (HTTP ${res.status}). Identifiants invalides ?`);
  }
  return data.access_token as string;
}

// Crée une commande PayPal pour le montant de la commande interne.
// reference_id = notre numéro de commande : il est relu à la capture pour
// vérifier que le paiement PayPal correspond bien à CETTE commande.
// Renvoie null si PayPal n'est pas configuré.
export async function createPaypalOrder(amountCents: number, orderNumber: string) {
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
          custom_id: orderNumber,
          amount: { currency_code: "EUR", value: (amountCents / 100).toFixed(2) },
        },
      ],
    }),
    cache: "no-store",
  });
  return res.json();
}

export type PaypalCaptureResult = {
  id?: string;
  status?: string;
  purchase_units?: {
    reference_id?: string;
    payments?: {
      captures?: { id?: string; status?: string; amount?: { currency_code?: string; value?: string } }[];
    };
  }[];
  name?: string;
  details?: unknown;
};

// Capture le paiement une fois que le client a validé sur PayPal.
export async function capturePaypalOrder(paypalOrderId: string): Promise<PaypalCaptureResult | null> {
  const config = await getPaypalConfig();
  if (!config) return null;

  const accessToken = await getAccessToken(config.clientId, config.clientSecret, config.base);
  const res = await fetch(`${config.base}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  return res.json();
}

// Vérifie qu'une capture PayPal correspond exactement à la commande interne :
// statut COMPLETED, même référence, même montant, même devise. Sans ce contrôle,
// n'importe qui pourrait payer une commande bon marché puis envoyer l'id PayPal
// obtenu avec l'id d'une autre commande (plus chère) pour la faire valider.
export function verifyPaypalCapture(
  capture: PaypalCaptureResult | null,
  expected: { orderNumber: string; priceCents: number }
): { ok: true; paymentRef: string } | { ok: false; error: string } {
  if (!capture) return { ok: false, error: "PayPal n'est pas configuré." };
  if (capture.status !== "COMPLETED") return { ok: false, error: "Paiement non confirmé par PayPal" };

  const unit = capture.purchase_units?.[0];
  const cap = unit?.payments?.captures?.find((c) => c.status === "COMPLETED") || unit?.payments?.captures?.[0];
  if (!unit || !cap) return { ok: false, error: "Réponse PayPal incomplète" };
  if (cap.status !== "COMPLETED") return { ok: false, error: "Paiement PayPal en attente, pas encore encaissé" };

  if (unit.reference_id !== expected.orderNumber) {
    return { ok: false, error: "Ce paiement PayPal ne correspond pas à cette commande." };
  }
  const paidCents = Math.round(parseFloat(cap.amount?.value || "0") * 100);
  if (cap.amount?.currency_code !== "EUR" || paidCents !== expected.priceCents) {
    return { ok: false, error: "Le montant payé ne correspond pas au montant de la commande." };
  }

  return { ok: true, paymentRef: cap.id || capture.id || "paypal" };
}
