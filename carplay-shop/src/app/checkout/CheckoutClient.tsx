"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

type Vehicle = { id: string; brand: string; model: string; year: string };

function eur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default function CheckoutClient({
  vehicle,
  formula,
  priceCents,
  stripeEnabled,
  paypalEnabled,
}: {
  vehicle: Vehicle;
  formula: "FILES_ONLY" | "PHYSICAL_CARD";
  priceCents: number;
  stripeEnabled: boolean;
  paypalEnabled: boolean;
}) {
  const router = useRouter();
  const isPhysical = formula === "PHYSICAL_CARD";

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    addressComp: "",
    postalCode: "",
    city: "",
    country: "France",
  });
  const [orderId, setOrderId] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "paiement">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: vehicle.id, formula, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création de la commande");
      setOrderId(data.orderId);
      setStep("paiement");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function payWithStripe() {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) window.location.href = data.url;
      else setError(data.error || "Impossible de démarrer le paiement par carte.");
    } catch (err: any) {
      setError("Erreur réseau, réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
  const paypalReady = paypalEnabled && !!paypalClientId;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32 }}>
      <div>
        {step === "form" && (
          <form onSubmit={submitForm} className="card" style={{ display: "grid", gap: 16 }}>
            <h3 style={{ marginBottom: 4 }}>Vos coordonnées</h3>
            <p style={{ fontSize: 13, marginBottom: 8 }}>
              Nécessaires pour vous envoyer votre facture et vos fichiers par email
              {isPhysical ? ", et pour l'expédition postale de votre carte mémoire." : "."}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label>Prénom</label>
                <input required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
              </div>
              <div>
                <label>Nom</label>
                <input required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
              </div>
            </div>

            <div>
              <label>Email (votre facture et vos fichiers y seront envoyés)</label>
              <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>

            <div>
              <label>Téléphone</label>
              <input required type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>

            {isPhysical && (
              <>
                <div>
                  <label>Adresse postale</label>
                  <input required value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Numéro et rue" />
                </div>
                <div>
                  <label>Complément d'adresse (optionnel)</label>
                  <input value={form.addressComp} onChange={(e) => update("addressComp", e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
                  <div>
                    <label>Code postal</label>
                    <input required value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} />
                  </div>
                  <div>
                    <label>Ville</label>
                    <input required value={form.city} onChange={(e) => update("city", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label>Pays</label>
                  <input required value={form.country} onChange={(e) => update("country", e.target.value)} />
                </div>
              </>
            )}

            {error && <p style={{ color: "var(--danger)", fontSize: 14 }}>{error}</p>}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Chargement..." : "Continuer vers le paiement"}
            </button>
          </form>
        )}

        {step === "paiement" && (
          <div className="card" style={{ display: "grid", gap: 20 }}>
            <h3>Choisissez votre moyen de paiement</h3>
            {error && <p style={{ color: "var(--danger)", fontSize: 14 }}>{error}</p>}

            {!stripeEnabled && !paypalReady && (
              <p style={{ color: "var(--amber)", fontSize: 14 }}>
                Aucun moyen de paiement n'est disponible pour le moment. Contactez-nous directement pour finaliser votre commande.
              </p>
            )}

            {stripeEnabled && (
              <button className="btn btn-primary" onClick={payWithStripe} disabled={loading}>
                Payer par carte bancaire
              </button>
            )}

            {paypalReady ? (
              <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "EUR" }}>
                <PayPalButtons
                  style={{ layout: "horizontal" }}
                  createOrder={async () => {
                    try {
                      const res = await fetch("/api/checkout/paypal/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!data.id) {
                        setError(data.error || "PayPal n'a pas pu démarrer le paiement.");
                        throw new Error(data.error || "PayPal error");
                      }
                      return data.id;
                    } catch (err) {
                      setError("Impossible de contacter PayPal. Vérifie la configuration.");
                      throw err;
                    }
                  }}
                  onApprove={async (data) => {
                    try {
                      const res = await fetch("/api/checkout/paypal/capture", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId, paypalOrderId: data.orderID }),
                      });
                      if (res.ok) router.push(`/commande/confirmation?order=${orderId}`);
                      else {
                        const body = await res.json().catch(() => ({}));
                        setError(body.error || "Le paiement PayPal n'a pas pu être confirmé.");
                      }
                    } catch {
                      setError("Erreur réseau lors de la confirmation PayPal.");
                    }
                  }}
                />
              </PayPalScriptProvider>
            ) : paypalEnabled ? (
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                PayPal est activé mais pas encore configuré (NEXT_PUBLIC_PAYPAL_CLIENT_ID manquant dans .env).
              </p>
            ) : null}

            <button className="btn btn-secondary" onClick={() => setStep("form")}>
              ← Modifier mes coordonnées
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{ height: "fit-content" }}>
        <p className="eyebrow" style={{ marginBottom: 12 }}>Récapitulatif</p>
        <p style={{ color: "var(--text)", fontWeight: 600, marginBottom: 4 }}>{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
        <p style={{ fontSize: 13, marginBottom: 20 }}>
          {isPhysical ? "Carte mémoire + guide(s) PDF, envoyée par la poste" : "Fichier d'activation + guide(s) PDF envoyés par email"}
        </p>
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--text-muted)" }}>Total</span>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}>{eur(priceCents)}</span>
        </div>
      </div>
    </div>
  );
}
