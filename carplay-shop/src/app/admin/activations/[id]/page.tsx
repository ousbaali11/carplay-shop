import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import DeleteFileButton from "@/components/DeleteFileButton";
import DeleteActivationTypeButton from "@/components/DeleteActivationTypeButton";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditActivationTypePage({ params, searchParams }: { params: { id: string }; searchParams: { enregistre?: string; erreur?: string } }) {
  const t = await prisma.activationType.findUnique({
    where: { id: params.id },
    include: { pdfs: { orderBy: { position: "asc" } }, _count: { select: { vehicles: true } } },
  });
  if (!t) notFound();

  return (
    <div className="admin-layout">
      <AdminSidebar active="activations" />
      <div className="admin-main narrow-sm">
        <div className="page-header">
          <h1 className="page-title">{t.name}</h1>
          <p className="page-lead sm">
            Utilisé par {t._count.vehicles} véhicule{t._count.vehicles !== 1 ? "s" : ""}.
          </p>
        </div>

        {searchParams.enregistre && (
          <div className="notice notice-success">
            <span className="notice-icon">✓</span> <span className="notice-text">Modifications enregistrées.</span>
          </div>
        )}

        {searchParams.erreur && (
          <div className="notice notice-error">
            <span className="notice-icon">✕</span> <span className="notice-text">{searchParams.erreur}</span>
          </div>
        )}

        <form action={`/api/admin/activation-types/${t.id}`} method="POST" encType="multipart/form-data" className="card form-card sectioned mb-20">
          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Identité</p>
              <p className="form-section-desc">Le nom apparaît dans la liste déroulante des fiches véhicule.</p>
            </div>
            <div>
              <label>Nom (la clé)</label>
              <input name="name" required defaultValue={t.name} />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Guides PDF</p>
              <p className="form-section-desc">Pour remplacer un guide : ajoute la nouvelle version, puis supprime l'ancienne.</p>
            </div>
            <div>
              <label>PDF actuels ({t.pdfs.length})</label>
              {t.pdfs.length > 0 && (
                <ul className="file-list">
                  {t.pdfs.map((p) => (
                    <li key={p.id} className="file-item row">
                      <span>{p.fileName}</span>
                      <DeleteFileButton url={`/api/admin/activation-types/${t.id}/pdfs/${p.id}`} />
                    </li>
                  ))}
                </ul>
              )}
              <label className="label-sub">Ajouter d'autres PDF (ou remplacer une mise à jour : ajoute la nouvelle version, puis supprime l'ancienne ci-dessus)</label>
              <input name="pdfs" type="file" accept="application/pdf" multiple />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary">Enregistrer</button>
          </div>
        </form>

        <div className="card danger-zone">
          <p className="eyebrow text-danger mb-10">Zone dangereuse</p>
          <p className="note mb-12">
            Supprime définitivement ce type d'activation et ses PDF. Les véhicules qui l'utilisaient
            perdent simplement l'association (ils ne sont pas supprimés).
          </p>
          <DeleteActivationTypeButton activationTypeId={t.id} label={t.name} />
        </div>
      </div>
    </div>
  );
}
