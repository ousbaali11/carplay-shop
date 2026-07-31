import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import ShipOrderForm from "@/components/ShipOrderForm";
import OrderStatusActions from "@/components/OrderStatusActions";
import ForceFinalizeButton from "@/components/ForceFinalizeButton";
import SendFilesForm from "@/components/SendFilesForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, { label: string; cls: string }> = {
  PENDING_PAYMENT: { label: "En attente de paiement", cls: "badge-pending" },
  PAID: { label: "Payée", cls: "badge-paid" },
  PREPARING: { label: "En préparation", cls: "badge-pending" },
  SHIPPED: { label: "Expédiée", cls: "badge-shipped" },
  COMPLETED: { label: "Terminée", cls: "badge-paid" },
  CANCELED: { label: "Annulée", cls: "badge-canceled" },
  REFUNDED: { label: "Remboursée", cls: "badge-canceled" },
};

function eur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default async function AdminOrderDetail({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { activationLinks: { orderBy: { position: "asc" } } },
  });
  if (!order) notFound();

  const isPhysical = order.formula === "PHYSICAL_CARD";

  return (
    <div className="admin-layout">
      <AdminSidebar active="commandes" />
      <div style={{ flex: 1, padding: "36px 40px", maxWidth: 760 }}>
        <p className="eyebrow">Commande</p>
        <h1 style={{ fontSize: 26, margin: "8px 0 24px" }} className="mono">{order.orderNumber}</h1>

        {!order.downloadToken && order.status !== "PENDING_PAYMENT" && (
          <ForceFinalizeButton orderId={order.id} />
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div className="card">
            <p className="eyebrow" style={{ marginBottom: 10 }}>Client</p>
            <p style={{ color: "var(--text)" }}>{order.firstName} {order.lastName}</p>
            <p style={{ fontSize: 14 }}>{order.email}</p>
            <p style={{ fontSize: 14 }}>{order.phone}</p>
          </div>
          <div className="card">
            <p className="eyebrow" style={{ marginBottom: 10 }}>Commande</p>
            <p style={{ fontSize: 14 }}>Véhicule : <span style={{ color: "var(--text)" }}>{order.vehicleBrand} {order.vehicleModel} ({order.vehicleYear})</span></p>
            <p style={{ fontSize: 14 }}>Formule : <span style={{ color: "var(--text)" }}>{isPhysical ? "Carte physique" : "Fichiers seuls"}</span></p>
            <p style={{ fontSize: 14 }}>Version logiciel autoradio : <span style={{ color: "var(--text)" }}>{order.radioSoftwareVersion || "—"}</span></p>
            <p style={{ fontSize: 14 }}>Montant : <span style={{ color: "var(--text)" }}>{eur(order.priceCents)}</span></p>
            <p style={{ fontSize: 14 }}>Paiement : <span style={{ color: "var(--text)" }}>{order.paymentMethod || "—"}</span></p>
            <p style={{ fontSize: 14 }}>Statut : <span className={`badge ${statusLabel[order.status].cls}`}>{statusLabel[order.status].label}</span></p>
          </div>
        </div>

        {isPhysical && (
          <div className="card" style={{ marginBottom: 20 }}>
            <p className="eyebrow" style={{ marginBottom: 10 }}>Adresse de livraison</p>
            <p style={{ fontSize: 14, color: "var(--text)" }}>
              {order.address}{order.addressComp ? `, ${order.addressComp}` : ""}<br />
              {order.postalCode} {order.city}<br />
              {order.country}
            </p>
          </div>
        )}

        {!isPhysical && (
          <SendFilesForm orderId={order.id} existingLinks={order.activationLinks} filesSentAt={order.filesSentAt} />
        )}

        {isPhysical && order.status === "PREPARING" && (
          <div className="card" style={{ marginBottom: 20 }}>
            <p className="eyebrow" style={{ marginBottom: 10 }}>Expédition</p>
            <ShipOrderForm orderId={order.id} />
          </div>
        )}

        {isPhysical && order.status === "SHIPPED" && (
          <div className="card" style={{ marginBottom: 20 }}>
            <p className="eyebrow" style={{ marginBottom: 10 }}>Expédiée</p>
            <p style={{ fontSize: 14, color: "var(--text)" }}>
              Le {order.shippedAt?.toLocaleDateString("fr-FR")} {order.trackingNumber ? `— suivi : ${order.trackingNumber}` : ""}
            </p>
          </div>
        )}

        <div className="card">
          <p className="eyebrow" style={{ marginBottom: 10 }}>Actions</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <a href={`/api/admin/orders/${order.id}/facture`} className="btn btn-secondary">Télécharger la facture</a>
          </div>
          <OrderStatusActions orderId={order.id} status={order.status} />
        </div>
      </div>
    </div>
  );
}