import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function DownloadPage({ params }: { params: { token: string } }) {
  const order = await prisma.order.findUnique({
    where: { downloadToken: params.token },
    include: {
      pdfs: { orderBy: { position: "asc" } },
      activationLinks: { orderBy: { position: "asc" } },
    },
  });

  const expired = order?.downloadExpiresAt ? new Date() > order.downloadExpiresAt : true;
  const isPhysical = order?.formula === "PHYSICAL_CARD";
  const filesPending = !isPhysical && !order?.filesSentAt;
  const valid = order && !expired && !filesPending && ["PAID", "PREPARING", "SHIPPED", "COMPLETED"].includes(order.status);
  const { invoicesEnabled } = await getSiteSettings();

  return (
    <>
      <Header />
      <section className="container" style={{ padding: "80px 0", maxWidth: 520, textAlign: "center" }}>
        {valid ? (
          <>
            <div style={{ fontSize: 44, marginBottom: 16 }}>📄</div>
            <h1 style={{ fontSize: 22, marginBottom: 10 }}>
              {order!.vehicleBrand} {order!.vehicleModel} ({order!.vehicleYear})
            </h1>
            <p style={{ marginBottom: 28 }}>
              Vos fichiers sont prêts. Ce lien reste valable jusqu'au{" "}
              {order!.downloadExpiresAt!.toLocaleDateString("fr-FR")}.
              {isPhysical && " Votre carte mémoire vous sera envoyée par courrier séparément."}
              {" "}Chaque fichier ne peut être téléchargé qu'une seule fois.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              {order!.pdfs.map((pdf) =>
                pdf.downloaded ? (
                  <div key={pdf.id} className="card" style={{ width: 300, padding: 12, textAlign: "left" }}>
                    <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                      {pdf.title || pdf.fileName} — <span style={{ color: "var(--amber)" }}>déjà téléchargé</span>
                    </p>
                  </div>
                ) : (
                  <a key={pdf.id} href={`/api/download/${params.token}/pdf/${pdf.id}`} className="btn btn-primary" style={{ width: 300 }}>
                    Télécharger : {pdf.title || pdf.fileName}
                  </a>
                )
              )}
              {order!.pdfs.length === 0 && (
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Aucun guide PDF n'a encore été ajouté pour ce véhicule.</p>
              )}

              {!isPhysical && order!.activationLinks.map((link, i) =>
                link.used ? (
                  <div key={link.id} className="card" style={{ width: 300, padding: 12, textAlign: "left" }}>
                    <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                      Fichier d'activation {order!.activationLinks.length > 1 ? `#${i + 1}` : ""} — <span style={{ color: "var(--amber)" }}>déjà téléchargé</span>
                    </p>
                  </div>
                ) : (
                  <a key={link.id} href={`/telechargement/${params.token}/fichier/${link.id}`} className="btn btn-amber" style={{ width: 300 }}>
                    Télécharger le fichier d'activation {order!.activationLinks.length > 1 ? `#${i + 1}` : ""}
                  </a>
                )
              )}

              {invoicesEnabled && (
                <a href={`/api/download/${params.token}/facture`} className="btn btn-secondary" style={{ width: 300 }}>
                  Télécharger ma facture
                </a>
              )}
            </div>
          </>
        ) : filesPending ? (
          <>
            <div style={{ fontSize: 44, marginBottom: 16 }}>⏳</div>
            <h1 style={{ fontSize: 22, marginBottom: 10 }}>Fichiers en cours de préparation</h1>
            <p>
              Votre paiement est bien confirmé. Vos fichiers d'activation sont en cours de préparation
              et vous recevrez un email dès qu'ils seront disponibles ici.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🔒</div>
            <h1 style={{ fontSize: 22, marginBottom: 10 }}>Lien invalide ou expiré</h1>
            <p>
              Ce lien de téléchargement n'est plus valide. Connectez-vous à votre espace client
              ou contactez le support en indiquant votre numéro de commande.
            </p>
          </>
        )}
      </section>
      <Footer />
    </>
  );
}