import AdminSidebar from "@/components/AdminSidebar";
import { requireAdminPage } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function NewActivationTypePage({ searchParams }: { searchParams: { erreur?: string } }) {
  await requireAdminPage();
  return (
    <div className="admin-layout">
      <AdminSidebar active="activations" />
      <div className="admin-main narrow-sm">
        <div className="page-header compact">
          <h1 className="page-title">Nouveau type d'activation</h1>
          <p className="page-lead premium-only">Un nom (la clé) et un ou plusieurs guides PDF (la valeur), réutilisables sur plusieurs véhicules.</p>
        </div>

        {searchParams.erreur && (
          <div className="notice notice-error">
            <span className="notice-icon">✕</span> <span className="notice-text">{searchParams.erreur}</span>
          </div>
        )}

        <form action="/api/admin/activation-types" method="POST" encType="multipart/form-data" className="card form-card sectioned">
          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Identité</p>
              <p className="form-section-desc">Le nom apparaît dans la liste déroulante des fiches véhicule.</p>
            </div>
            <div>
              <label>Nom (la clé, ex: "MST2 Volkswagen Delphi")</label>
              <input name="name" required placeholder="MST2 Volkswagen Delphi" />
            </div>
          </div>
          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Guides PDF</p>
              <p className="form-section-desc">Envoyés au client avec chaque commande d'un véhicule utilisant ce type. 25 Mo max par fichier.</p>
            </div>
            <div>
              <label>PDF (un ou plusieurs)</label>
              <input name="pdfs" type="file" accept="application/pdf" multiple />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary">Créer</button>
          </div>
        </form>
      </div>
    </div>
  );
}
