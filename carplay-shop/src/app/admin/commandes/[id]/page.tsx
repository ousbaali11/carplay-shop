import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import { requireAdminPage } from "@/lib/admin";
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
  await requireAdminPage();
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { activationLinks: { orderBy: { position: "asc" } } },
  });
  if (!order) notFound();

  const isPhysical = order.formula === "PHYSICAL_CARD";
  const status = statusLabel[order.status] || { label: order.status, cls: "badge-pending" };

  return (
    <div className="admin-layout">
      <AdminSidebar active="commandes" />
      <div className="admin-main narrow-lg">
        <div className="order-heading">
          <p className="eyebrow">Commande</p>
          <h1 className="page-title mono order-title">{order.orderNumber}</h1>
          <span className={`badge order-heading-badge ${status.cls}`}>{status.label}</span>
        </div>

        {!order.downloadToken && order.status !== "PENDING_PAYMENT" && (
          <ForceFinalizeButton orderId={order.id} />
        )}

        <div className="detail-grid">
          <div className="card">
            <p className="eyebrow mb-10">Client</p>
            <p className="detail-name">{order.firstName} {order.lastName}</p>
            <p className="detail-line">{order.email}</p>
            <p className="detail-line">{order.phone}</p>
          </div>
          <div className="card">
            <p className="eyebrow mb-10">Commande</p>
            <p className="detail-line"><span className="detail-label">Véhicule :</span> <span className="detail-value">{order.vehicleTitle}</span></p>
            <p className="detail-line"><span className="detail-label">Année de véhicule :</span> <span className="detail-value">{order.vehicleYear}</span></p>
            <p className="detail-line"><span className="detail-label">Formule :</span> <span className="detail-value">{isPhysical ? "Carte physique" : "Fichiers seuls"}</span></p>
            <p className="detail-line"><span className="detail-label">Version logiciel autoradio :</span> <span className="detail-value">{order.radioSoftwareVersion || "—"}</span></p>
            <p className="detail-line"><span className="detail-label">Montant :</span> <span className="detail-value detail-amount">{eur(order.priceCents)}</span></p>
            <p className="detail-line"><span className="detail-label">Paiement :</span> <span className="detail-value">{order.paymentMethod || "—"}</span></p>
            <p className="detail-line"><span className="detail-label">Statut :</span> <span className={`badge ${status.cls}`}>{status.label}</span></p>
          </div>
        </div>

        {isPhysical && (
          <div className="card mb-20">
            <p className="eyebrow mb-10">Adresse de livraison</p>
            <p className="detail-block">
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
          <div className="card mb-20">
            <p className="eyebrow mb-10">Expédition</p>
            <ShipOrderForm orderId={order.id} />
          </div>
        )}

        {isPhysical && order.status === "SHIPPED" && (
          <div className="card mb-20">
            <p className="eyebrow mb-10">Expédiée</p>
            <p className="detail-block">
              Le {order.shippedAt?.toLocaleDateString("fr-FR")} {order.trackingNumber ? `— suivi : ${order.trackingNumber}` : ""}
            </p>
          </div>
        )}

        <div className="card">
          <p className="eyebrow mb-10">Actions</p>
          <div className="actions-row mb-14">
            <a href={`/api/admin/orders/${order.id}/facture`} className="btn btn-secondary">Télécharger la facture</a>
          </div>
          <OrderStatusActions orderId={order.id} status={order.status} />
        </div>
      </div>
    </div>
  );
}
