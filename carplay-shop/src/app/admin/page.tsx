import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import InlineStatusSelect from "@/components/InlineStatusSelect";
import Link from "next/link";

export const dynamic = "force-dynamic";


function eur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default async function AdminDashboard() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const totalRevenue = orders
    .filter((o) => o.status !== "PENDING_PAYMENT" && o.status !== "CANCELED")
    .reduce((sum, o) => sum + o.priceCents, 0);
  const toPrepare = orders.filter((o) => o.status === "PREPARING").length;

  return (
    <div className="admin-layout">
      <AdminSidebar active="commandes" />
      <div style={{ flex: 1, padding: "36px 40px" }}>
        <h1 style={{ fontSize: 26, marginBottom: 24 }}>Commandes</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          <div className="card">
            <p className="eyebrow">Chiffre d'affaires</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 26, marginTop: 8 }}>{eur(totalRevenue)}</p>
          </div>
          <div className="card">
            <p className="eyebrow">Commandes totales</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 26, marginTop: 8 }}>{orders.length}</p>
          </div>
          <div className="card" style={{ borderColor: toPrepare > 0 ? "var(--amber)" : undefined }}>
            <p className="eyebrow" style={{ color: toPrepare > 0 ? "var(--amber)" : undefined }}>Cartes à préparer</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 26, marginTop: 8 }}>{toPrepare}</p>
          </div>
        </div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Commande</th>
                <th>Client</th>
                <th>Véhicule</th>
                <th>Formule</th>
                <th>Montant</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                return (
                  <tr key={o.id}>
                    <td className="mono">{o.orderNumber}</td>
                    <td>{o.firstName} {o.lastName}<br /><span style={{ color: "var(--text-muted)", fontSize: 12 }}>{o.email}</span></td>
                    <td>{o.vehicleBrand} {o.vehicleModel} ({o.vehicleYear})</td>
                    <td style={{ fontSize: 13 }}>{o.formula === "PHYSICAL_CARD" ? "Carte" : "Fichiers"}</td>
                    <td>{eur(o.priceCents)}</td>
                    <td><InlineStatusSelect orderId={o.id} status={o.status} /></td>
                    <td><Link href={`/admin/commandes/${o.id}`} style={{ color: "var(--cyan)", fontSize: 13 }}>Détail</Link></td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--text-muted)", textAlign: "center", padding: 24 }}>Aucune commande pour le moment.</td></tr>
              )}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
