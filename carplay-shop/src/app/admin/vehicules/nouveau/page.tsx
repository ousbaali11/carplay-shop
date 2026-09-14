import AdminSidebar from "@/components/AdminSidebar";
import { requireAdminPage } from "@/lib/admin";
import RichTextEditor from "@/components/RichTextEditor";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewVehiclePage({ searchParams }: { searchParams: { erreur?: string } }) {
  await requireAdminPage();
  const activationTypes = await prisma.activationType.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="admin-layout">
      <AdminSidebar active="vehicules" />
      <div className="admin-main narrow">
        <div className="page-header compact">
          <h1 className="page-title">Ajouter un véhicule</h1>
          <p className="page-lead premium-only">Une annonce = un véhicule, avec ses deux formules et ses photos.</p>
        </div>

        {searchParams.erreur && (
          <div className="notice notice-error">
            <span className="notice-icon">✕</span> <span className="notice-text">{searchParams.erreur}</span>
          </div>
        )}

        <form action="/api/admin/vehicles" method="POST" encType="multipart/form-data" className="card form-card sectioned">
          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Identité de l'annonce</p>
              <p className="form-section-desc">Le titre apparaît dans le catalogue, la description sur la fiche.</p>
            </div>
            <div>
              <label className="label-strong">Titre de l'annonce</label>
              <input name="title" required placeholder="ex: Kit CarPlay MIB2 — Volkswagen / Audi / Seat / Skoda" />
            </div>
            <div>
              <label>Description (optionnel)</label>
              <RichTextEditor name="description" initialValue="" />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Tarifs</p>
              <p className="form-section-desc">Prix TTC affichés au client, par formule.</p>
            </div>
            <div className="form-grid-2">
              <div>
                <label>Prix formule "Fichiers seuls" (€)</label>
                <input name="priceFilesEur" type="number" step="0.01" required defaultValue="29.90" />
              </div>
              <div>
                <label>Prix formule "Carte physique" (€)</label>
                <input name="pricePhysicalEur" type="number" step="0.01" required defaultValue="49.90" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Photos</p>
              <p className="form-section-desc">Communes aux deux formules. JPEG, PNG ou WebP, 8 Mo max par photo.</p>
            </div>
            <div>
              <label>Photos du véhicule (communes aux deux formules)</label>
              <input name="images" type="file" accept="image/*" multiple />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Activation et livraison</p>
              <p className="form-section-desc">Guide commun envoyé au client, et rappel du fonctionnement de chaque formule.</p>
            </div>
            <div>
              <label>Activation (guide commun, optionnel — communs aux deux formules)</label>
              <select name="activationTypeId" defaultValue="">
                <option value="">Aucun</option>
                {activationTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <p className="field-hint">
                Liste gérée depuis l'onglet "Activations" du menu admin.
              </p>
            </div>

            <div className="formula-note formula-note-files mt-4">
              <p className="eyebrow mb-10">Formule 1 — Fichiers seuls</p>
              <p className="note-text">
                Préparation des fichiers dans Google Drive et aucun lien à saisir ici, et un guide
                pour l'installer sera envoyé automatiquement.
              </p>
            </div>

            <div className="formula-note formula-note-card">
              <p className="eyebrow text-amber mb-10">Formule 2 — Carte physique</p>
              <p className="note-text">
                La préparation du fichier bootable se fait entièrement en interne, aucun lien à saisir
                ici, et un guide pour l'installer sera envoyé automatiquement.
              </p>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Visibilité</p>
              <p className="form-section-desc">Une annonce masquée n'apparaît ni dans le catalogue ni sur l'accueil.</p>
            </div>
            <div className="check-row">
              <input type="checkbox" name="active" defaultChecked className="check-input" id="active" />
              <label htmlFor="active" className="check-label">Visible immédiatement sur le site</label>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary">Créer le véhicule</button>
          </div>
        </form>
      </div>
    </div>
  );
}
