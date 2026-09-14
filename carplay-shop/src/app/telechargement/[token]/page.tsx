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
  // 1. La commande doit exister, être payée et non expirée. Sinon : lien invalide.
  const orderOk = !!order && !expired && ["PAID", "PREPARING", "SHIPPED", "COMPLETED"].includes(order.status);
  // 2. Seulement pour une commande valide "fichiers seuls" : liens pas encore envoyés par l'admin.
  const filesPending = orderOk && !isPhysical && !order!.filesSentAt;
  const valid = orderOk && !filesPending;
  const { invoicesEnabled, whatsappUrl } = await getSiteSettings();

  return (
    <>
      <Header />
      <section className="container status-section w-520">
        {valid ? (
          <>
            <div className="status-icon sm">📄</div>
            <h1 className="status-title xs">
              {order!.vehicleTitle} ({order!.vehicleYear})
            </h1>
            <p className="mb-28">
              Vos fichiers sont prêts. Ce lien reste valable jusqu'au{" "}
              {order!.downloadExpiresAt!.toLocaleDateString("fr-FR")}.
              {isPhysical && " Votre carte mémoire vous sera envoyée par Mondial Relais séparément."}
              {" "}Chaque fichier ne peut être téléchargé qu'une seule fois.
            </p>
            <div className="download-list">
              {order!.pdfs.map((pdf) =>
                pdf.downloaded ? (
                  <div key={pdf.id} className="card download-done">
                    <p className="download-done-text">
                      {pdf.title || pdf.fileName} — <span className="text-amber">déjà téléchargé</span>
                    </p>
                  </div>
                ) : (
                  <a key={pdf.id} href={`/api/download/${params.token}/pdf/${pdf.id}`} className="btn btn-primary w-300">
                    Télécharger : {pdf.title || pdf.fileName}
                  </a>
                )
              )}
              {order!.pdfs.length === 0 && (
                <p className="note-muted">Aucun guide PDF n'a encore été ajouté pour ce véhicule.</p>
              )}

              {!isPhysical && order!.activationLinks.map((link, i) =>
                link.used ? (
                  <div key={link.id} className="card download-done">
                    <p className="download-done-text">
                      Fichier d'activation {order!.activationLinks.length > 1 ? `#${i + 1}` : ""} — <span className="text-amber">déjà téléchargé</span>
                    </p>
                  </div>
                ) : (
                  <a key={link.id} href={`/telechargement/${params.token}/fichier/${link.id}`} className="btn btn-amber w-300">
                    Télécharger le fichier d'activation {order!.activationLinks.length > 1 ? `#${i + 1}` : ""}
                  </a>
                )
              )}

              {invoicesEnabled && (
                <a href={`/api/download/${params.token}/facture`} className="btn btn-secondary w-300">
                  Télécharger ma facture
                </a>
              )}

              {whatsappUrl && (
                <a
                  href={`${whatsappUrl}?text=${encodeURIComponent(`Bonjour, je vous contacte à propos de ma commande ${order!.orderNumber}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary w-300"
                >
                  Nous contacter sur WhatsApp
                </a>
              )}
            </div>
          </>
        ) : filesPending ? (
          <>
            <div className="status-icon sm">⏳</div>
            <h1 className="status-title xs">Fichiers en cours de préparation</h1>
            <p>
              Votre paiement est bien confirmé. Vos fichiers d'activation sont en cours de préparation
              et vous recevrez un email dès qu'ils seront disponibles ici.
            </p>
          </>
        ) : (
          <>
            <div className="status-icon sm">🔒</div>
            <h1 className="status-title xs">Lien invalide ou expiré</h1>
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
