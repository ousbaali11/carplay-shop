import AdminSidebar from "@/components/AdminSidebar";
import RichTextEditor from "@/components/RichTextEditor";
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
          <div>
            <label style={{ fontWeight: 700, color: "var(--text)" }}>Titre de l'annonce</label>
            <input name="title" required placeholder="ex: Kit CarPlay MIB2 — Volkswagen / Audi / Seat / Skoda" />
          </div>

          <div>
            <label>Description (optionnel)</label>
            <RichTextEditor name="description" initialValue="" />
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
            <p style={{ fontSize: 13 }}>
              Préparation des fichiers dans Google Drive et aucun lien à saisir ici, et un guide
              pour l'installer sera envoyé automatiquement.
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
