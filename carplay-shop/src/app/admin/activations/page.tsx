import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import { requireAdminPage } from "@/lib/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ActivationTypesListPage() {
  await requireAdminPage();
  const types = await prisma.activationType.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { pdfs: true, vehicles: true } } },
  });

  return (
    <div className="admin-layout">
      <AdminSidebar active="activations" />
      <div className="admin-main">
        <div className="page-header-row">
          <div className="page-header">
            <h1 className="page-title">Types d'activation</h1>
            <p className="page-lead">
              Guides communs, réutilisables sur plusieurs véhicules (ex: "MST2 Volkswagen Delphi").
              Une fois créés, sélectionnables depuis la fiche d'un véhicule — leurs PDF sont alors
              envoyés automatiquement en plus des fichiers propres à ce véhicule, pour les deux formules.
            </p>
          </div>
          <Link href="/admin/activations/nouveau" className="btn btn-primary">+ Nouveau type</Link>
        </div>

        <div className="card table-card">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nom (clé)</th>
                  <th>PDF</th>
                  <th>Véhicules concernés</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {types.map((t) => (
                  <tr key={t.id}>
                    <td className="cell-strong">{t.name}</td>
                    <td>{t._count.pdfs}</td>
                    <td>{t._count.vehicles}</td>
                    <td className="cell-action"><Link href={`/admin/activations/${t.id}`} className="link-accent">Gérer</Link></td>
                  </tr>
                ))}
                {types.length === 0 && (
                  <tr><td colSpan={4} className="table-empty">Aucun type d'activation pour le moment.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
