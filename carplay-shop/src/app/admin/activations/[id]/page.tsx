import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import DeleteFileButton from "@/components/DeleteFileButton";
import DeleteActivationTypeButton from "@/components/DeleteActivationTypeButton";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditActivationTypePage({ params, searchParams }: { params: { id: string }; searchParams: { enregistre?: string } }) {
  const t = await prisma.activationType.findUnique({
    where: { id: params.id },
    include: { pdfs: { orderBy: { position: "asc" } }, _count: { select: { vehicles: true } } },
  });
  if (!t) notFound();

  return (
    <div className="admin-layout">
      <AdminSidebar active="activations" />
      <div style={{ flex: 1, padding: "36px 40px", maxWidth: 560 }}>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>{t.name}</h1>
        <p style={{ marginBottom: 24, fontSize: 13 }}>
          Utilisé par {t._count.vehicles} véhicule{t._count.vehicles !== 1 ? "s" : ""}.
        </p>

        {searchParams.enregistre && (
          <div className="card" style={{ borderColor: "var(--success)", marginBottom: 20, padding: "14px 18px" }}>
            <span style={{ color: "var(--success)" }}>✓</span> <span style={{ color: "var(--text)" }}>Modifications enregistrées.</span>
          </div>
        )}

        <form action={`/api/admin/activation-types/${t.id}`} method="POST" encType="multipart/form-data" className="card" style={{ display: "grid", gap: 14, marginBottom: 20 }}>
          <div>
            <label>Nom (la clé)</label>
            <input name="name" required defaultValue={t.name} />
          </div>

          <div>
            <label>PDF actuels ({t.pdfs.length})</label>
            {t.pdfs.length > 0 && (
              <ul style={{ margin: "0 0 10px", padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
                {t.pdfs.map((p) => (
                  <li key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, background: "var(--bg-elevated)", padding: "6px 10px", borderRadius: 6 }}>
                    <span>{p.fileName}</span>
                    <DeleteFileButton url={`/api/admin/activation-types/${t.id}/pdfs/${p.id}`} />
                  </li>
                ))}
              </ul>
            )}
            <label style={{ fontSize: 12 }}>Ajouter d'autres PDF (ou remplacer une mise à jour : ajoute la nouvelle version, puis supprime l'ancienne ci-dessus)</label>
            <input name="pdfs" type="file" accept="application/pdf" multiple />
          </div>

          <button className="btn btn-primary" style={{ justifySelf: "start" }}>Enregistrer</button>
        </form>

        <div className="card">
          <p className="eyebrow" style={{ marginBottom: 10, color: "var(--danger)" }}>Zone dangereuse</p>
          <p style={{ fontSize: 13, marginBottom: 12 }}>
            Supprime définitivement ce type d'activation et ses PDF. Les véhicules qui l'utilisaient
            perdent simplement l'association (ils ne sont pas supprimés).
          </p>
          <DeleteActivationTypeButton activationTypeId={t.id} label={t.name} />
        </div>
      </div>
    </div>
  );
}
