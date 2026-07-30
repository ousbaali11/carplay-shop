import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Passerelle à usage unique vers un lien d'activation précis (ex: Google Drive).
// Premier accès : marque ce lien comme utilisé, puis redirige. Accès suivant :
// bloqué avec message explicite (anti-fraude).
export default async function ActivationLinkGatePage({ params }: { params: { token: string; linkId: string } }) {
  const order = await prisma.order.findUnique({ where: { downloadToken: params.token } });

  const expired = order?.downloadExpiresAt ? new Date() > order.downloadExpiresAt : true;
  const validOrder =
    order && !expired && order.formula === "FILES_ONLY" && ["PAID", "PREPARING", "SHIPPED", "COMPLETED"].includes(order.status);

  if (!validOrder) {
    return (
      <>
        <Header />
        <section className="container" style={{ padding: "80px 0", maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 22, marginBottom: 10 }}>Lien invalide ou indisponible</h1>
          <p>Ce lien de téléchargement n'existe pas ou plus.</p>
        </section>
        <Footer />
      </>
    );
  }

  const link = await prisma.orderActivationLink.findFirst({ where: { id: params.linkId, orderId: order!.id } });
  if (!link) {
    return (
      <>
        <Header />
        <section className="container" style={{ padding: "80px 0", maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 22, marginBottom: 10 }}>Lien introuvable</h1>
        </section>
        <Footer />
      </>
    );
  }

  if (link.used) {
    return (
      <>
        <Header />
        <section className="container" style={{ padding: "80px 0", maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>⛔</div>
          <h1 style={{ fontSize: 22, marginBottom: 10 }}>Fichier déjà téléchargé</h1>
          <p>
            Ce lien a déjà été utilisé le {link.usedAt?.toLocaleDateString("fr-FR")} et ne peut l'être qu'une
            seule fois. Contacte le support si tu penses qu'il y a une erreur.
          </p>
        </section>
        <Footer />
      </>
    );
  }

  await prisma.orderActivationLink.update({
    where: { id: link.id },
    data: { used: true, usedAt: new Date() },
  });

  redirect(link.url);
}
