import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import DeleteUserButton from "@/components/DeleteUserButton";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar active="utilisateurs" />
      <div style={{ flex: 1, padding: "36px 40px" }}>
        <h1 style={{ fontSize: 26, marginBottom: 24 }}>Utilisateurs ({users.length})</h1>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
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
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.role === "ADMIN" ? (
                      <span className="badge badge-shipped">Admin</span>
                    ) : (
                      <span className="badge badge-paid">Client</span>
                    )}
                  </td>
                  <td>{u._count.orders}</td>
                  <td style={{ fontSize: 13 }}>{u.createdAt.toLocaleDateString("fr-FR")}</td>
                  <td>{u.role !== "ADMIN" && <DeleteUserButton userId={u.id} label={`${u.firstName} ${u.lastName}`} />}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: 24 }}>Aucun utilisateur.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
