import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";
import { finalizeOrderPayment } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { order?: string; session_id?: string };
}) {
  let order = searchParams.order
    ? await prisma.order.findUnique({ where: { id: searchParams.order } })
    : null;

  // Filet de sécurité : si le webhook Stripe n'est pas (encore) configuré — typiquement
  // en test local — on vérifie directement auprès de Stripe si la session a bien été
  // payée, et on finalise la commande depuis ici. En production avec le webhook actif,
  // ceci ne fait rien de plus car la commande est déjà finalisée (idempotent).
if (order && order.status === "PENDING_PAYMENT" && searchParams.session_id) {
    try {
      const stripe = await getStripeClient();
      if (stripe) {
        const session = await stripe.checkout.sessions.retrieve(searchParams.session_id);
        if (session.payment_status === "paid") {
          order = await finalizeOrderPayment(order.id, "STRIPE", (session.payment_intent as string) || session.id);
        }
      }
    } catch {
      // Si la clé Stripe n'est pas configurée ou la session introuvable, on laisse
      // l'état "en attente" s'afficher normalement ci-dessous.
    }
  }

  const isPaid = order && order.status !== "PENDING_PAYMENT";

  return (
    <>
      <Header />
      <section className="container" style={{ padding: "80px 0", maxWidth: 560, textAlign: "center" }}>
        {isPaid ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h1 style={{ fontSize: 28, marginBottom: 12 }}>Merci pour votre commande !</h1>
            <p style={{ marginBottom: 24 }}>
              Un email de confirmation vient d'être envoyé à <b style={{ color: "var(--text)" }}>{order?.email}</b>
              {order?.formula === "FILES_ONLY"
                ? " avec votre facture. Vos fichiers d'activation vous seront envoyés séparément dès qu'ils seront prêts."
                : " avec votre facture et le lien pour accéder à vos fichiers."}
            </p>
            <p className="mono" style={{ fontSize: 13, marginBottom: 32 }}>N° de commande : {order?.orderNumber}</p>
            <Link href="/" className="btn btn-primary">Retour à l'accueil</Link>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h1 style={{ fontSize: 24, marginBottom: 12 }}>Confirmation du paiement en cours...</h1>
            <p>Actualisez cette page dans quelques instants. Vous recevrez un email dès que le paiement sera confirmé.</p>
          </>
        )}
      </section>
      <Footer />
    </>
  );
}
