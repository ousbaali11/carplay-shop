import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, { label: string; cls: string }> = {
  PENDING_PAYMENT: { label: "En attente de paiement", cls: "badge-pending" },
  PAID: { label: "Payée", cls: "badge-paid" },
  PREPARING: { label: "Carte en préparation", cls: "badge-pending" },
  SHIPPED: { label: "Expédiée", cls: "badge-shipped" },
  CANCELED: { label: "Annulée", cls: "badge-canceled" },
  REFUNDED: { label: "Remboursée", cls: "badge-canceled" },
};

function eur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const orders = userId
    ? await prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <>
      <Header />
      <section className="container" style={{ padding: "50px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <p className="eyebrow">Espace client</p>
            <h1 style={{ fontSize: 26, marginTop: 6 }}>Bonjour {session?.user?.name}</h1>
          </div>
          <SignOutButton />
        </div>

        <h3 style={{ marginBottom: 14 }}>Passer une nouvelle commande</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 36 }}>
          <Link href="/vehicules?formule=fichiers" className="card" style={{ textDecoration: "none", display: "block" }}>
            <p className="eyebrow" style={{ color: "var(--text-muted)" }}>Formule 1</p>
            <p style={{ color: "var(--text)", fontWeight: 600, marginTop: 6 }}>Fichiers seuls</p>
          </Link>
          <Link href="/vehicules?formule=carte" className="card" style={{ textDecoration: "none", display: "block", borderColor: "var(--cyan)" }}>
            <p className="eyebrow">Formule 2</p>
            <p style={{ color: "var(--text)", fontWeight: 600, marginTop: 6 }}>Carte mémoire physique</p>
          </Link>
        </div>

        <h3 style={{ marginBottom: 14 }}>Mes commandes</h3>
        {orders.length === 0 ? (
          <p>Vous n'avez pas encore de commande.</p>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Véhicule</th>
                  <th>Formule</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Fichiers</th>
                  <th>Facture</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const s = statusLabel[o.status];
                  const canDownload = o.downloadToken && ["PAID", "PREPARING", "SHIPPED"].includes(o.status);
                  return (
                    <tr key={o.id}>
                      <td className="mono">{o.orderNumber}</td>
                      <td>{o.vehicleBrand} {o.vehicleModel} ({o.vehicleYear})</td>
                      <td style={{ fontSize: 13 }}>{o.formula === "PHYSICAL_CARD" ? "Carte physique" : "Fichiers seuls"}</td>
                      <td>{eur(o.priceCents)}</td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                      <td>
                        {canDownload ? (
                          <Link href={`/telechargement/${o.downloadToken}`} style={{ color: "var(--cyan)", fontSize: 13 }}>
                            Accéder
                          </Link>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>—</span>
                        )}
                      </td>
                      <td>
                        {canDownload ? (
                          <a href={`/api/download/${o.downloadToken}/facture`} style={{ color: "var(--cyan)", fontSize: 13 }}>
                            Télécharger
                          </a>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}

        <h3 style={{ margin: "40px 0 14px" }}>Sécurité</h3>
        <ChangePasswordForm />
      </section>
      <Footer />
    </>
  );
}
