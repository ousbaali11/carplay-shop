import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DownloadPage({ params }: { params: { token: string } }) {
  const order = await prisma.order.findUnique({
    where: { downloadToken: params.token },
    include: {
      pdfs: { orderBy: { position: "asc" } },
      activationFiles: { orderBy: { position: "asc" } },
    },
  });

  const expired = order?.downloadExpiresAt ? new Date() > order.downloadExpiresAt : true;
  const valid = order && !expired && ["PAID", "PREPARING", "SHIPPED"].includes(order.status);
  const isPhysical = order?.formula === "PHYSICAL_CARD";

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
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              {order!.pdfs.map((pdf) => (
                <a key={pdf.id} href={`/api/download/${params.token}/pdf/${pdf.id}`} className="btn btn-primary" style={{ width: 300 }}>
                  Télécharger : {pdf.title || pdf.fileName}
                </a>
              ))}
              {order!.pdfs.length === 0 && (
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Aucun guide PDF n'a encore été ajouté pour ce véhicule.</p>
              )}
              {!isPhysical && order!.activationFiles?.length > 0 && (
                <>
                  {order!.activationFiles.map((f: any) => (
                    <a key={f.id} href={`/api/download/${params.token}/activation/${f.id}`} className="btn btn-amber" style={{ width: 300 }}>
                      Télécharger : {f.fileName}
                    </a>
                  ))}
                </>
              )}
              <a href={`/api/download/${params.token}/facture`} className="btn btn-secondary" style={{ width: 300 }}>
                Télécharger ma facture
              </a>
            </div>
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
