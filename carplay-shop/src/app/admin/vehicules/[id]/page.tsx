import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import DeleteVehicleButton from "@/components/DeleteVehicleButton";
import DeleteFileButton from "@/components/DeleteFileButton";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function FileList({ files, vehicleId, kind }: { files: { id: string; fileName: string; title?: string | null }[]; vehicleId: string; kind: "pdfs" }) {
  if (files.length === 0) return null;
  return (
    <ul style={{ margin: "0 0 10px", padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
      {files.map((f) => (
        <li key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, background: "var(--bg-elevated)", padding: "6px 10px", borderRadius: 6 }}>
          <span>{f.title || f.fileName}</span>
          <DeleteFileButton url={`/api/admin/vehicles/${vehicleId}/${kind}/${f.id}`} />
        </li>
      ))}
    </ul>
  );
}

export default async function EditVehiclePage({ params, searchParams }: { params: { id: string }; searchParams: { enregistre?: string; cree?: string } }) {
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

  const pdfsFilesOnly = v.pdfs.filter((p) => p.formula === "FILES_ONLY");

  return (
    <div className="admin-layout">
      <AdminSidebar active="vehicules" />
      <div style={{ flex: 1, padding: "36px 40px", maxWidth: 640 }}>
        <h1 style={{ fontSize: 26, marginBottom: 24 }}>{v.brand} {v.model} ({v.year})</h1>

        {searchParams.enregistre && (
          <div className="card" style={{ borderColor: "var(--success)", marginBottom: 20, padding: "14px 18px" }}>
            <span style={{ color: "var(--success)" }}>✓</span> <span style={{ color: "var(--text)" }}>Modifications enregistrées.</span>
          </div>
        )}

        <form action={`/api/admin/vehicles/${v.id}`} method="POST" encType="multipart/form-data" className="card" style={{ display: "grid", gap: 14, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label>Marque</label>
              <input name="brand" required defaultValue={v.brand} />
            </div>
            <div>
              <label>Modèle</label>
              <input name="model" required defaultValue={v.model} />
            </div>
            <div>
              <label>Année</label>
              <input name="year" required defaultValue={v.year} />
            </div>
          </div>

          <div>
            <label>Description (optionnel)</label>
            <textarea name="description" rows={3} defaultValue={v.description || ""} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label>Prix formule "Fichiers seuls" (€)</label>
              <input name="priceFilesEur" type="number" step="0.01" required defaultValue={(v.priceFilesCents / 100).toFixed(2)} />
            </div>
            <div>
              <label>Prix formule "Carte physique" (€)</label>
              <input name="pricePhysicalEur" type="number" step="0.01" required defaultValue={(v.pricePhysicalCents / 100).toFixed(2)} />
            </div>
          </div>

          <div>
            <label>Photos actuelles ({v.images.length}) — communes aux deux formules</label>
            {v.images.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                {v.images.map((img) => (
                  <div key={img.id} style={{ width: 96 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/vehicules/image/${img.id}`} alt="" style={{ width: 96, height: 72, objectFit: "cover", borderRadius: 6, display: "block", marginBottom: 4 }} />
                    <DeleteFileButton url={`/api/admin/vehicles/${v.id}/images/${img.id}`} />
                  </div>
                ))}
              </div>
            )}
            <label style={{ fontSize: 12 }}>Ajouter d'autres photos</label>
            <input name="images" type="file" accept="image/*" multiple />
          </div>

          <div>
            <label>Activation (guide commun, optionnel — commun aux deux formules)</label>
            <select name="activationTypeId" defaultValue={v.activationTypeId || ""}>
              <option value="">Aucun</option>
              {activationTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              Liste gérée depuis l'onglet "Activations" du menu admin.
            </p>
          </div>

          <div style={{ borderTop: "2px solid var(--cyan)", paddingTop: 14 }}>
            <p className="eyebrow" style={{ marginBottom: 10 }}>Formule 1 — Fichiers seuls</p>

            <label style={{ fontSize: 13 }}>Guides Carte SD ({pdfsFilesOnly.length})</label>
            <FileList files={pdfsFilesOnly} vehicleId={v.id} kind="pdfs" />
            <input name="pdfsFilesOnly" type="file" accept="application/pdf" multiple />
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              Les liens Google Drive se saisissent désormais commande par commande, depuis "Commandes" dans le menu admin.
            </p>
          </div>

          <div style={{ borderTop: "2px solid var(--amber)", paddingTop: 14 }}>
            <p className="eyebrow" style={{ marginBottom: 10, color: "var(--amber)" }}>Formule 2 — Carte physique</p>
            <p style={{ fontSize: 13 }}>
              La préparation du fichier bootable se fait entièrement en interne, aucun lien à saisir
              ici, et un guide pour l'installer sera envoyé automatiquement.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
            <input type="checkbox" name="active" defaultChecked={v.active} style={{ width: "auto" }} id="active" />
            <label htmlFor="active" style={{ margin: 0 }}>Visible sur le site</label>
          </div>

          <button className="btn btn-primary" style={{ justifySelf: "start" }}>Enregistrer les modifications</button>
        </form>

        <div className="card">
          <p className="eyebrow" style={{ marginBottom: 10, color: "var(--danger)" }}>Zone dangereuse</p>
          <p style={{ fontSize: 13, marginBottom: 12 }}>
            Supprime définitivement ce véhicule et tous ses fichiers. Les commandes déjà payées ne sont pas affectées.
          </p>
          <DeleteVehicleButton vehicleId={v.id} label={`${v.brand} ${v.model}`} />
        </div>
      </div>
    </div>
  );
}