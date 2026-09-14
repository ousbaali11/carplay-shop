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
    orderBy: { title: "asc" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      pdfs: true,
      _count: { select: { images: true } },
    },
  });

  return (
    <div className="admin-layout">
      <AdminSidebar active="vehicules" />
      <div className="admin-main">
        {searchParams.cree && (
          <div className="notice notice-success">
            <span className="notice-icon">✓</span>{" "}
            <span className="notice-text">Véhicule "{decodeURIComponent(searchParams.cree)}" créé avec succès.</span>
          </div>
        )}

        <div className="page-header-row">
          <h1 className="page-title">Véhicules ({vehicles.length})</h1>
          <Link href="/admin/vehicules/nouveau" className="btn btn-primary">+ Ajouter un véhicule</Link>
        </div>

        <div className="card table-card">
          <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Véhicule</th>
                <th className="num">Prix fichiers</th>
                <th className="num">Prix carte</th>
                <th>Fichiers</th>
                <th>Visible</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => {
                const physicalCount = v.pdfs.filter((p) => p.formula === "PHYSICAL_CARD").length;
                return (
                <tr key={v.id}>
                  <td>
                    <div className="thumb-cell">
                      {v.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`/api/vehicules/image/${v.images[0].id}`} alt="" />
                      ) : null}
                    </div>
                  </td>
                  <td className="cell-strong">{v.title}</td>
                  <td className="num">{eur(v.priceFilesCents)}</td>
                  <td className="num">{eur(v.pricePhysicalCents)}</td>
                  <td className="cell-xs">
                    {v._count.images} photo{v._count.images !== 1 ? "s" : ""}<br/>
                    F2: {physicalCount} PDF
                  </td>
                  <td><ToggleActiveButton vehicleId={v.id} active={v.active} /></td>
                  <td className="cell-action"><Link href={`/admin/vehicules/${v.id}`} className="link-accent">Modifier</Link></td>
                </tr>
                );
              })}
              {vehicles.length === 0 && (
                <tr><td colSpan={7} className="table-empty">
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
