import AdminSidebar from "@/components/AdminSidebar";

export default function NewActivationTypePage() {
  return (
    <div className="admin-layout">
      <AdminSidebar active="activations" />
      <div style={{ flex: 1, padding: "36px 40px", maxWidth: 560 }}>
        
        <h1 style={{ fontSize: 26, marginBottom: 24 }}>Nouveau type d'activation</h1>

        <form action="/api/admin/activation-types" method="POST" encType="multipart/form-data" className="card" style={{ display: "grid", gap: 14 }}>
          <div>
            <label>Nom (la clé, ex: "MST2 Volkswagen Delphi")</label>
            <input name="name" required placeholder="MST2 Volkswagen Delphi" />
          </div>
          <div>
            <label>PDF (un ou plusieurs)</label>
            <input name="pdfs" type="file" accept="application/pdf" multiple />
          </div>
          <button className="btn btn-primary" style={{ justifySelf: "start" }}>Créer</button>
        </form>
      </div>
    </div>
  );
}
