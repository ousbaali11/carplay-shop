import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CGVPage() {
  return (
    <>
      <Header />
      <section className="container" style={{ padding: "60px 0", maxWidth: 720 }}>
        <h1 style={{ fontSize: 28, marginBottom: 24 }}>Conditions générales de vente</h1>

        <div style={{ display: "grid", gap: 24 }}>
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>1. Objet</h3>
            <p>
              Les présentes conditions régissent la vente de fichiers numériques d'activation et de
              cartes mémoire physiques permettant l'activation de CarPlay / Android Auto,
              proposés sur ce site par [Nom de l'entreprise / auto-entreprise — à compléter], [adresse
              du siège — à compléter], [SIRET — à compléter].
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>2. Produits</h3>
            <p>
              Deux formules sont proposées : (1) la livraison par email de fichiers d'activation et
              d'un guide PDF ; (2) la livraison par email du guide PDF et l'envoi postal d'une carte
              mémoire physique préparée par nos soins.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>3. Prix et paiement</h3>
            <p>
              Les prix sont indiqués en euros, toutes taxes comprises. Le paiement s'effectue en
              ligne par carte bancaire (Stripe) ou PayPal, au moment de la commande.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>4. Livraison des contenus numériques</h3>
            <p>
              Le guide PDF et, le cas échéant, les fichiers d'activation sont transmis par email à
              l'adresse renseignée lors de la commande, immédiatement après confirmation du
              paiement, via un lien de téléchargement personnel valable 30 jours.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>5. Livraison physique</h3>
            <p>
              Pour la formule incluant une carte mémoire physique, celle-ci est expédiée à l'adresse
              postale renseignée lors de la commande, sous un délai indicatif de [X jours ouvrés — à
              compléter], via [nom du transporteur — à compléter].
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>6. Droit de rétractation</h3>
            <p>
              Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation
              ne peut être exercé pour la fourniture d'un contenu numérique non fourni sur un support
              matériel dont l'exécution a commencé après accord préalable exprès du consommateur.
              [Cette clause doit être adaptée avec un professionnel du droit avant mise en ligne.]
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>7. Responsabilité</h3>
            <p>
              [À compléter : limites d'usage, compatibilité selon véhicule/autoradio, garanties
              applicables.]
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>8. Contact</h3>
            <p>[Email et/ou téléphone de contact du service client — à compléter]</p>
          </div>
        </div>

        <p style={{ marginTop: 32, fontSize: 13, color: "var(--amber)" }}>
          ⚠️ Ce texte est un modèle de départ, pas un document juridique validé. Fais-le relire par un
          professionnel (avocat, expert-comptable) avant la mise en ligne réelle du site.
        </p>
      </section>
      <Footer />
    </>
  );
}
