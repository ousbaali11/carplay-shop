import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import DeleteVehicleButton from "@/components/DeleteVehicleButton";
import DeleteFileButton from "@/components/DeleteFileButton";
import RichTextEditor from "@/components/RichTextEditor";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditVehiclePage({ params, searchParams }: { params: { id: string }; searchParams: { enregistre?: string; cree?: string; erreur?: string } }) {
  const [v, activationTypes] = await Promise.all([
    prisma.vehicle.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { position: "asc" } },
        pdfs: { orderBy: { position: "asc" } },
      },
    }),
    prisma.activationType.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!v) notFound();

  return (
    <div className="admin-layout">
      <AdminSidebar active="vehicules" />
      <div className="admin-main narrow">
        <div className="page-header compact">
          <h1 className="page-title">{v.title}</h1>
          <p className="page-lead premium-only">
            {v.active ? "Visible sur le site." : "Masquée sur le site."} {v.images.length} photo{v.images.length !== 1 ? "s" : ""}.
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

        <form action={`/api/admin/vehicles/${v.id}`} method="POST" encType="multipart/form-data" className="card form-card sectioned mb-20">
          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Identité de l'annonce</p>
              <p className="form-section-desc">Le titre apparaît dans le catalogue, la description sur la fiche.</p>
            </div>
            <div>
              <label className="label-strong">Titre de l'annonce</label>
              <input name="title" required defaultValue={v.title} />
            </div>
            <div>
              <label>Description (optionnel)</label>
              <RichTextEditor name="description" initialValue={v.description || ""} />
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
                <input name="priceFilesEur" type="number" step="0.01" required defaultValue={(v.priceFilesCents / 100).toFixed(2)} />
              </div>
              <div>
                <label>Prix formule "Carte physique" (€)</label>
                <input name="pricePhysicalEur" type="number" step="0.01" required defaultValue={(v.pricePhysicalCents / 100).toFixed(2)} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Photos</p>
              <p className="form-section-desc">Communes aux deux formules. Supprime une photo ou ajoutes-en d'autres.</p>
            </div>
            <div>
              <label>Photos actuelles ({v.images.length}) — communes aux deux formules</label>
              {v.images.length > 0 && (
                <div className="thumb-grid">
                  {v.images.map((img) => (
                    <div key={img.id} className="thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/api/vehicules/image/${img.id}`} alt="" />
                      <DeleteFileButton url={`/api/admin/vehicles/${v.id}/images/${img.id}`} />
                    </div>
                  ))}
                </div>
              )}
              <label className="label-sub">Ajouter d'autres photos</label>
              <input name="images" type="file" accept="image/*" multiple />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <p className="form-section-title">Activation et livraison</p>
              <p className="form-section-desc">Guide commun envoyé au client, et rappel du fonctionnement de chaque formule.</p>
            </div>
            <div>
              <label>Activation (guide commun, optionnel — commun aux deux formules)</label>
              <select name="activationTypeId" defaultValue={v.activationTypeId || ""}>
                <option value="">Aucun</option>
                {activationTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <p className="field-hint">
                Liste gérée depuis l'onglet "Activations" du menu admin.
              </p>
            </div>

            <div className="formula-note formula-note-files">
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
              <input type="checkbox" name="active" defaultChecked={v.active} className="check-input" id="active" />
              <label htmlFor="active" className="check-label">Visible sur le site</label>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary">Enregistrer les modifications</button>
          </div>
        </form>

        <div className="card danger-zone">
          <p className="eyebrow text-danger mb-10">Zone dangereuse</p>
          <p className="note mb-12">
            Supprime définitivement ce véhicule et tous ses fichiers. Les commandes déjà payées ne sont pas affectées.
          </p>
          <DeleteVehicleButton vehicleId={v.id} label={v.title} />
        </div>
      </div>
    </div>
  );
}
