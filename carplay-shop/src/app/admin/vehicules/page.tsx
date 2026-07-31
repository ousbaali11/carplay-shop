import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import ToggleActiveButton from "@/components/ToggleActiveButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

function eur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default async function AdminVehiclesPage({ searchParams }: { searchParams: { cree?: string } }) {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: [{ brand: "asc" }, { model: "asc" }],
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      pdfs: true,
      _count: { select: { images: true } },
    },
  });

  return (
    <div className="admin-layout">
      <AdminSidebar active="vehicules" />
      <div style={{ flex: 1, padding: "36px 40px" }}>
        {searchParams.cree && (
          <div className="card" style={{ borderColor: "var(--success)", marginBottom: 20, padding: "14px 18px" }}>
            <span style={{ color: "var(--success)" }}>✓</span>{" "}
            <span style={{ color: "var(--text)" }}>Véhicule "{decodeURIComponent(searchParams.cree)}" créé avec succès.</span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 26 }}>Véhicules ({vehicles.length})</h1>
          <Link href="/admin/vehicules/nouveau" className="btn btn-primary">+ Ajouter un véhicule</Link>
        </div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Véhicule</th>
                <th>Prix fichiers</th>
                <th>Prix carte</th>
                <th>Fichiers</th>
                <th>Visible</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => {
                const filesOnlyCount = v.pdfs.filter((p) => p.formula === "FILES_ONLY").length;
                const physicalCount = v.pdfs.filter((p) => p.formula === "PHYSICAL_CARD").length;
                return (
                <tr key={v.id}>
                  <td>
                    <div style={{ width: 44, height: 32, borderRadius: 4, overflow: "hidden", background: "var(--bg-elevated)" }}>
                      {v.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`/api/vehicules/image/${v.images[0].id}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : null}
                    </div>
                  </td>
                  <td>{v.brand} {v.model}<br /><span style={{ color: "var(--text-muted)", fontSize: 12 }}>{v.year}</span></td>
                  <td>{eur(v.priceFilesCents)}</td>
                  <td>{eur(v.pricePhysicalCents)}</td>
                  <td style={{ fontSize: 12 }}>
                    {v._count.images} photo{v._count.images !== 1 ? "s" : ""}<br/>
                    F1: {filesOnlyCount} PDF · F2: {physicalCount} PDF
                  </td>
                  <td><ToggleActiveButton vehicleId={v.id} active={v.active} /></td>
                  <td><Link href={`/admin/vehicules/${v.id}`} style={{ color: "var(--cyan)", fontSize: 13 }}>Modifier</Link></td>
                </tr>
                );
              })}
              {vehicles.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--text-muted)", textAlign: "center", padding: 24 }}>
                  Aucun véhicule au catalogue. Cliquez sur "+ Ajouter un véhicule" pour commencer.
                </td></tr>
              )}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}