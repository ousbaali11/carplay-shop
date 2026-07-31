import AdminSidebar from "@/components/AdminSidebar";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewVehiclePage() {
  const activationTypes = await prisma.activationType.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="admin-layout">
      <AdminSidebar active="vehicules" />
      <div style={{ flex: 1, padding: "36px 40px", maxWidth: 640 }}>
      
        <h1 style={{ fontSize: 26, marginBottom: 24 }}>Ajouter un véhicule</h1>

        <form action="/api/admin/vehicles" method="POST" encType="multipart/form-data" className="card" style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label>Marque</label>
              <input name="brand" required placeholder="ex: Volkswagen" />
            </div>
            <div>
              <label>Modèle</label>
              <input name="model" required placeholder="ex: Golf 7" />
            </div>
            <div>
              <label>Année</label>
              <input name="year" required placeholder="ex: 2019 ou 2018-2021" />
            </div>
          </div>

          <div>
            <label>Description (optionnel)</label>
            <textarea name="description" rows={3} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label>Prix formule "Fichiers seuls" (€)</label>
              <input name="priceFilesEur" type="number" step="0.01" required defaultValue="29.90" />
            </div>
            <div>
              <label>Prix formule "Carte physique" (€)</label>
              <input name="pricePhysicalEur" type="number" step="0.01" required defaultValue="49.90" />
            </div>
          </div>

          <div>
            <label>Photos du véhicule (communes aux deux formules)</label>
            <input name="images" type="file" accept="image/*" multiple />
          </div>

          <div>
            <label>Activation (guide commun, optionnel — communs aux deux formules)</label>
            <select name="activationTypeId" defaultValue="">
              <option value="">Aucun</option>
              {activationTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              Liste gérée depuis l'onglet "Activations" du menu admin.
            </p>
          </div>

          <div style={{ borderTop: "2px solid var(--cyan)", paddingTop: 14, marginTop: 4 }}>
            <p className="eyebrow" style={{ marginBottom: 10 }}>Formule 1 — Fichiers seuls</p>
            <label style={{ fontSize: 13 }}>Guides Carte SD</label>
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
            <input type="checkbox" name="active" defaultChecked style={{ width: "auto" }} id="active" />
            <label htmlFor="active" style={{ margin: 0 }}>Visible immédiatement sur le site</label>
          </div>

          <button className="btn btn-primary" style={{ justifySelf: "start" }}>Créer le véhicule</button>
        </form>
      </div>
    </div>
  );
}