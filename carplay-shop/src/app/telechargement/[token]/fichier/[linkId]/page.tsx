import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { isSafeHttpUrl } from "@/lib/html";

export const dynamic = "force-dynamic";

function Message({ icon, title, children }: { icon: string; title: string; children?: React.ReactNode }) {
  return (
    <>
      <Header />
      <section className="container" style={{ padding: "80px 0", maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>{icon}</div>
        <h1 style={{ fontSize: 22, marginBottom: 10 }}>{title}</h1>
        {children}
      </section>
      <Footer />
    </>
  );
}

// Passerelle à usage unique vers un lien d'activation précis (ex: Google Drive).
// Premier accès : marque ce lien comme utilisé, puis redirige. Accès suivant :
// bloqué avec message explicite (anti-fraude).
export default async function ActivationLinkGatePage({ params }: { params: { token: string; linkId: string } }) {
  const order =
    params.token && params.token.length <= 128
      ? await prisma.order.findUnique({ where: { downloadToken: params.token } })
      : null;

  const expired = order?.downloadExpiresAt ? new Date() > order.downloadExpiresAt : true;
  const validOrder =
    order && !expired && order.formula === "FILES_ONLY" && ["PAID", "PREPARING", "SHIPPED", "COMPLETED"].includes(order.status);

  if (!validOrder) {
    return (
      <Message icon="🔒" title="Lien invalide ou indisponible">
        <p>Ce lien de téléchargement n'existe pas ou plus.</p>
      </Message>
    );
  }

  const link = await prisma.orderActivationLink.findFirst({ where: { id: params.linkId, orderId: order.id } });
  if (!link) {
    return <Message icon="🔒" title="Lien introuvable" />;
  }

  if (link.used) {
    return (
      <Message icon="⛔" title="Fichier déjà téléchargé">
        <p>
          Ce lien a déjà été utilisé le {link.usedAt?.toLocaleDateString("fr-FR")} et ne peut l'être qu'une
          seule fois. Contacte le support si tu penses qu'il y a une erreur.
        </p>
      </Message>
    );
  }

  // Vérifié AVANT de consommer le lien : si l'URL enregistrée est invalide, on
  // ne "brûle" pas l'unique accès du client.
  if (!isSafeHttpUrl(link.url)) {
    return (
      <Message icon="⚠️" title="Lien indisponible">
        <p>Ce lien n'est pas valide. Contacte le support en indiquant ton numéro de commande {order.orderNumber}.</p>
      </Message>
    );
  }

  // Consommation atomique : deux ouvertures simultanées ne peuvent pas passer
  // toutes les deux.
  const claimed = await prisma.orderActivationLink.updateMany({
    where: { id: link.id, used: false },
    data: { used: true, usedAt: new Date() },
  });
  if (claimed.count === 0) {
    return (
      <Message icon="⛔" title="Fichier déjà téléchargé">
        <p>Ce lien a déjà été utilisé et ne peut l'être qu'une seule fois.</p>
      </Message>
    );
  }

  redirect(link.url);
}
