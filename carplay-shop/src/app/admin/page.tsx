import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import InlineStatusSelect from "@/components/InlineStatusSelect";
import Link from "next/link";

export const dynamic = "force-dynamic";

function eur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function OrdersTable({ orders, showFilesSent }: { orders: any[]; showFilesSent: boolean }) {
  return (
    <div className="card table-card">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Commande</th>
              <th>Client</th>
              <th>Véhicule</th>
              <th>Année</th>
              <th>Version logiciel autoradio</th>
              <th className="num">Montant</th>
              <th>Statut</th>
              {showFilesSent && <th>Fichiers envoyés</th>}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="mono">{o.orderNumber}</td>
                <td>
                  <span className="cell-strong">{o.firstName} {o.lastName}</span>
                  <br />
                  <span className="cell-muted">{o.email}</span>
                </td>
                <td>{o.vehicleTitle}</td>
                <td className="cell-sm">{o.vehicleYear}</td>
                <td className="cell-sm">{o.radioSoftwareVersion || "—"}</td>
                <td className="num">{eur(o.priceCents)}</td>
                <td><InlineStatusSelect orderId={o.id} status={o.status} /></td>
                {showFilesSent && (
                  <td>
                    {o.filesSentAt ? (
                      <span className="text-success cell-sm">✓ {o.filesSentAt.toLocaleDateString("fr-FR")}</span>
                    ) : (
                      <span className="text-amber cell-sm">À insérer</span>
                    )}
                  </td>
                )}
                <td className="cell-action"><Link href={`/admin/commandes/${o.id}`} className="link-accent">Détail</Link></td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={showFilesSent ? 9 : 8} className="table-empty">Aucune commande pour le moment.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function AdminDashboard() {
  const allOrders = await prisma.order.findMany({
    where: { status: { not: "PENDING_PAYMENT" } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const filesOnlyOrders = allOrders.filter((o) => o.formula === "FILES_ONLY");
  const physicalOrders = allOrders.filter((o) => o.formula === "PHYSICAL_CARD");

  // Chiffre d'affaires réellement encaissé : hors commandes annulées ET remboursées.
  const totalRevenue = allOrders
    .filter((o) => o.status !== "PENDING_PAYMENT" && o.status !== "CANCELED" && o.status !== "REFUNDED")
    .reduce((sum, o) => sum + o.priceCents, 0);
  const toPrepare = allOrders.filter((o) => o.status === "PREPARING").length;
  const filesToInsert = filesOnlyOrders.filter((o) => o.downloadToken && !o.filesSentAt).length;

  return (
    <div className="admin-layout">
      <AdminSidebar active="commandes" />
      <div className="admin-main">
        <h1 className="page-title mb-24">Commandes</h1>

        <div className="stat-grid">
          <div className="card stat-card">
            <p className="eyebrow">Chiffre d'affaires</p>
            <p className="stat-value">{eur(totalRevenue)}</p>
          </div>
          <div className="card stat-card">
            <p className="eyebrow">Commandes totales</p>
            <p className="stat-value">{allOrders.length}</p>
          </div>
          <div className={`card stat-card${filesToInsert > 0 ? " is-alert" : ""}`}>
            <p className="eyebrow">Fichiers à insérer</p>
            <p className="stat-value">{filesToInsert}</p>
          </div>
          <div className={`card stat-card${toPrepare > 0 ? " is-alert" : ""}`}>
            <p className="eyebrow">Cartes à préparer</p>
            <p className="stat-value">{toPrepare}</p>
          </div>
        </div>

        <h2 className="section-title">Formule 1 — Fichiers seuls</h2>
        <div className="mb-32">
          <OrdersTable orders={filesOnlyOrders} showFilesSent />
        </div>

        <h2 className="section-title">Formule 2 — Carte physique</h2>
        <OrdersTable orders={physicalOrders} showFilesSent={false} />
      </div>
    </div>
  );
}
