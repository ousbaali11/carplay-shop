import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import { requireAdminPage } from "@/lib/admin";
import DeleteUserButton from "@/components/DeleteUserButton";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdminPage();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="admin-layout">
      <AdminSidebar active="utilisateurs" />
      <div className="admin-main">
        <h1 className="page-title mb-24">Utilisateurs ({users.length})</h1>

        <div className="card table-card">
          <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Commandes</th>
                <th>Inscrit le</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="cell-strong">{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.role === "ADMIN" ? (
                      <span className="badge badge-shipped">Admin</span>
                    ) : (
                      <span className="badge badge-paid">Client</span>
                    )}
                  </td>
                  <td>{u._count.orders}</td>
                  <td className="cell-sm">{u.createdAt.toLocaleDateString("fr-FR")}</td>
                  <td className="cell-action">{u.role !== "ADMIN" && <DeleteUserButton userId={u.id} label={`${u.firstName} ${u.lastName}`} />}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="table-empty">Aucun utilisateur.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
