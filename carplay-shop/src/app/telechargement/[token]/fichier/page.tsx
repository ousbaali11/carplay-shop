import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Passerelle à usage unique vers le lien d'activation (ex: Google Drive).
// Premier accès : marque le lien comme utilisé, puis redirige vers le vrai lien.
// Accès suivant : bloqué, avec message explicite (anti-fraude).
//
// Limite technique honnête : ceci empêche la réutilisation DE CE BOUTON, mais
// si le lien réel (Drive) a déjà été révélé au navigateur une première fois,
// rien n'empêche techniquement de le rouvrir depuis l'historique du navigateur.
// Une vraie révocation par destinataire nécessiterait une intégration directe
// avec l'API du service d'hébergement (Drive, etc.), plus complexe.
export default async function ActivationFileGatePage({ params }: { params: { token: string } }) {
  const order = await prisma.order.findUnique({ where: { downloadToken: params.token } });

  const expired = order?.downloadExpiresAt ? new Date() > order.downloadExpiresAt : true;
  const valid =
    order &&
    !expired &&
    order.formula === "FILES_ONLY" &&
    ["PAID", "PREPARING", "SHIPPED"].includes(order.status) &&
    !!order.activationLink;

  if (!valid) {
    return (
      <>
        <Header />
        <section className="container" style={{ padding: "80px 0", maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 22, marginBottom: 10 }}>Lien invalide ou indisponible</h1>
          <p>Ce lien de téléchargement n'existe pas ou plus, ou aucun fichier n'a été configuré pour cette commande.</p>
        </section>
        <Footer />
      </>
    );
  }

  if (order!.activationLinkUsed) {
    return (
      <>
        <Header />
        <section className="container" style={{ padding: "80px 0", maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>⛔</div>
          <h1 style={{ fontSize: 22, marginBottom: 10 }}>Fichier déjà téléchargé</h1>
          <p>
            Ce lien a déjà été utilisé le {order!.activationLinkUsedAt?.toLocaleDateString("fr-FR")} et ne peut
            l'être qu'une seule fois. Contacte le support si tu penses qu'il y a une erreur.
          </p>
        </section>
        <Footer />
      </>
    );
  }

  // Marque comme utilisé AVANT de rediriger : même si le client abandonne la
  // page suivante, le lien reste consommé (comportement volontairement strict).
  await prisma.order.update({
    where: { id: order!.id },
    data: { activationLinkUsed: true, activationLinkUsedAt: new Date() },
  });

  redirect(order!.activationLink!);
}
