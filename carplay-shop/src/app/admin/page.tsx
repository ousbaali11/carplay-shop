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
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Commande</th>
              <th>Client</th>
              <th>Véhicule</th>
              <th>Année</th>
              <th>Version logiciel autoradio</th>
              <th>Montant</th>
              <th>Statut</th>
              {showFilesSent && <th>Fichiers envoyés</th>}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="mono">{o.orderNumber}</td>
                <td>{o.firstName} {o.lastName}<br /><span style={{ color: "var(--text-muted)", fontSize: 12 }}>{o.email}</span></td>
                <td>{o.vehicleTitle}</td>
                <td style={{ fontSize: 13 }}>{o.vehicleYear}</td>
                <td style={{ fontSize: 13 }}>{o.radioSoftwareVersion || "—"}</td>
                <td>{eur(o.priceCents)}</td>
                <td><InlineStatusSelect orderId={o.id} status={o.status} /></td>
                {showFilesSent && (
                  <td>
                    {o.filesSentAt ? (
                      <span style={{ color: "var(--success)", fontSize: 13 }}>✓ {o.filesSentAt.toLocaleDateString("fr-FR")}</span>
                    ) : (
                      <span style={{ color: "var(--amber)", fontSize: 13 }}>À insérer</span>
                    )}
                  </td>
                )}
                <td><Link href={`/admin/commandes/${o.id}`} style={{ color: "var(--cyan)", fontSize: 13 }}>Détail</Link></td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={showFilesSent ? 9 : 8} style={{ color: "var(--text-muted)", textAlign: "center", padding: 24 }}>Aucune commande pour le moment.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function AdminDashboard() {
  const allOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const filesOnlyOrders = allOrders.filter((o) => o.formula === "FILES_ONLY");
  const physicalOrders = allOrders.filter((o) => o.formula === "PHYSICAL_CARD");

  const totalRevenue = allOrders
    .filter((o) => o.status !== "PENDING_PAYMENT" && o.status !== "CANCELED")
    .reduce((sum, o) => sum + o.priceCents, 0);
  const toPrepare = allOrders.filter((o) => o.status === "PREPARING").length;
  const filesToInsert = filesOnlyOrders.filter((o) => o.downloadToken && !o.filesSentAt).length;

  return (
    <div className="admin-layout">
      <AdminSidebar active="commandes" />
      <div style={{ flex: 1, padding: "36px 40px" }}>
        <h1 style={{ fontSize: 26, marginBottom: 24 }}>Commandes</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          <div className="card">
            <p className="eyebrow">Chiffre d'affaires</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 26, marginTop: 8 }}>{eur(totalRevenue)}</p>
          </div>
          <div className="card">
            <p className="eyebrow">Commandes totales</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 26, marginTop: 8 }}>{allOrders.length}</p>
          </div>
          <div className="card" style={{ borderColor: filesToInsert > 0 ? "var(--amber)" : undefined }}>
            <p className="eyebrow" style={{ color: filesToInsert > 0 ? "var(--amber)" : undefined }}>Fichiers à insérer</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 26, marginTop: 8 }}>{filesToInsert}</p>
          </div>
          <div className="card" style={{ borderColor: toPrepare > 0 ? "var(--amber)" : undefined }}>
            <p className="eyebrow" style={{ color: toPrepare > 0 ? "var(--amber)" : undefined }}>Cartes à préparer</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 26, marginTop: 8 }}>{toPrepare}</p>
          </div>
        </div>

        <h2 style={{ fontSize: 20, marginBottom: 12 }}>Formule 1 — Fichiers seuls</h2>
        <div style={{ marginBottom: 32 }}>
          <OrdersTable orders={filesOnlyOrders} showFilesSent />
        </div>

        <h2 style={{ fontSize: 20, marginBottom: 12 }}>Formule 2 — Carte physique</h2>
        <OrdersTable orders={physicalOrders} showFilesSent={false} />
      </div>
    </div>
  );
}
