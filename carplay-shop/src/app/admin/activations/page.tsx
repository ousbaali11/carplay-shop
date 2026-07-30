import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ActivationTypesListPage() {
  const types = await prisma.activationType.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { pdfs: true, vehicles: true } } },
  });

  return (
    <div className="admin-layout">
      <AdminSidebar active="activations" />
      <div style={{ flex: 1, padding: "36px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, marginBottom: 8 }}>Types d'activation</h1>
            <p style={{ maxWidth: 520 }}>
              Guides communs, réutilisables sur plusieurs véhicules (ex: "MST2 Volkswagen Delphi").
              Une fois créés, sélectionnables depuis la fiche d'un véhicule — leurs PDF sont alors
              envoyés automatiquement en plus des fichiers propres à ce véhicule, pour les deux formules.
            </p>
          </div>
          <Link href="/admin/activations/nouveau" className="btn btn-primary">+ Nouveau type</Link>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
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
                    <td>{t.name}</td>
                    <td>{t._count.pdfs}</td>
                    <td>{t._count.vehicles}</td>
                    <td><Link href={`/admin/activations/${t.id}`} style={{ color: "var(--cyan)", fontSize: 13 }}>Gérer</Link></td>
                  </tr>
                ))}
                {types.length === 0 && (
                  <tr><td colSpan={4} style={{ color: "var(--text-muted)", textAlign: "center", padding: 24 }}>Aucun type d'activation pour le moment.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
