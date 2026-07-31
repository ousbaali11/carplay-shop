import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/orders";
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
  COMPLETED: { label: "Terminée", cls: "badge-paid" },
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
  const { invoicesEnabled, whatsappUrl } = await getSiteSettings();

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
                  {invoicesEnabled && <th>Facture</th>}
                  {whatsappUrl && <th>WhatsApp</th>}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const s = statusLabel[o.status];
                  const canDownload =
                    o.downloadToken &&
                    ["PAID", "PREPARING", "SHIPPED", "COMPLETED"].includes(o.status) &&
                    (o.formula === "PHYSICAL_CARD" || !!o.filesSentAt);
                  const filesPending = o.formula === "FILES_ONLY" && o.downloadToken && !o.filesSentAt;
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
                        ) : filesPending ? (
                          <span style={{ color: "var(--amber)", fontSize: 13 }}>En préparation</span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>—</span>
                        )}
                      </td>
                      {invoicesEnabled && (
                        <td>
                          {canDownload ? (
                            <a href={`/api/download/${o.downloadToken}/facture`} style={{ color: "var(--cyan)", fontSize: 13 }}>
                              Télécharger
                            </a>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>—</span>
                          )}
                        </td>
                      )}
                      {whatsappUrl && (
                        <td>
                          <a
                            href={`${whatsappUrl}?text=${encodeURIComponent(`Bonjour, je vous contacte à propos de ma commande ${o.orderNumber}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Nous contacter sur WhatsApp à propos de cette commande"
                            title="Contacter sur WhatsApp"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.35 5.07L2 22l5.1-1.33A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
                                stroke="#25D366"
                                strokeWidth="2"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8.5 8.7c.15-.4.5-.4.8-.4h.5c.2 0 .45 0 .6.4.2.5.6 1.5.65 1.6.05.1.1.25 0 .4-.1.15-.15.25-.3.4l-.4.45c-.15.15-.3.3-.15.6.15.3.7 1.15 1.5 1.85.9.8 1.6 1.05 1.9 1.2.3.15.5.1.65-.05.2-.2.45-.5.7-.8.2-.2.4-.25.65-.15.3.1 1.5.7 1.75.85.25.1.4.2.45.3.1.15.1.75-.15 1.4-.25.65-1.45 1.3-2 1.35-.5.05-1.05.1-3.4-.9-2.9-1.25-4.75-4.2-4.9-4.4-.15-.2-1.2-1.6-1.2-3.05 0-1.45.75-2.15 1-2.45z"
                                fill="#25D366"
                              />
                            </svg>
                          </a>
                        </td>
                      )}
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
