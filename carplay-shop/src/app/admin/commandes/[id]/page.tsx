import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import ShipOrderForm from "@/components/ShipOrderForm";
import OrderStatusActions from "@/components/OrderStatusActions";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, { label: string; cls: string }> = {
  PENDING_PAYMENT: { label: "En attente de paiement", cls: "badge-pending" },
  PAID: { label: "Payée", cls: "badge-paid" },
  PREPARING: { label: "En préparation", cls: "badge-pending" },
  SHIPPED: { label: "Expédiée", cls: "badge-shipped" },
  CANCELED: { label: "Annulée", cls: "badge-canceled" },
  REFUNDED: { label: "Remboursée", cls: "badge-canceled" },
};

function eur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default async function AdminOrderDetail({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) notFound();

  const isPhysical = order.formula === "PHYSICAL_CARD";

  const vehicle = order.vehicleId
    ? await prisma.vehicle.findUnique({ where: { id: order.vehicleId } })
    : null;

  return (
    <div className="admin-layout">
      <AdminSidebar active="commandes" />
      <div style={{ flex: 1, padding: "36px 40px", maxWidth: 760 }}>
        <p className="eyebrow">Commande</p>
        <h1 style={{ fontSize: 26, margin: "8px 0 24px" }} className="mono">{order.orderNumber}</h1>

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

        {isPhysical && ["PREPARING", "SHIPPED"].includes(order.status) && (
          <div className="card" style={{ marginBottom: 20 }}>
            <p className="eyebrow" style={{ marginBottom: 10 }}>Préparation de la carte</p>
            <p style={{ fontSize: 14, marginBottom: 12 }}>
              Lien source du véhicule pour préparer la carte mémoire physique (usage interne, jamais transmis au client).
            </p>
            {vehicle?.activationLinkPhysicalCard ? (
              <a href={vehicle.activationLinkPhysicalCard} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ justifySelf: "start" }}>
                Ouvrir le lien source ↗
              </a>
            ) : (
              <p style={{ fontSize: 13, color: "var(--amber)" }}>
                Aucun lien d'activation "carte physique" n'a été configuré pour ce véhicule.
              </p>
            )}
          </div>
        )}

        {!isPhysical && (
          <div className="card" style={{ marginBottom: 20 }}>
            <p className="eyebrow" style={{ marginBottom: 10 }}>Lien d'activation (client)</p>
            <p style={{ fontSize: 14 }}>
              Statut :{" "}
              {order.activationLinkUsed ? (
                <span style={{ color: "var(--amber)" }}>déjà téléchargé le {order.activationLinkUsedAt?.toLocaleDateString("fr-FR")}</span>
              ) : order.activationLink ? (
                <span style={{ color: "var(--success)" }}>pas encore téléchargé</span>
              ) : (
                <span style={{ color: "var(--text-muted)" }}>aucun lien n'était configuré au moment du paiement</span>
              )}
            </p>
          </div>
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