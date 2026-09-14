import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SECTIONS: [string, string][] = [
  [
    "1. Objet",
    "Les présentes conditions régissent la vente de fichiers numériques d'activation et de cartes mémoire physiques permettant l'activation de CarPlay / Android Auto, proposés sur ce site par [Nom de l'entreprise / auto-entreprise — à compléter], [adresse du siège — à compléter], [SIRET — à compléter].",
  ],
  [
    "2. Produits",
    "Deux formules sont proposées : (1) la livraison par email de fichiers d'activation et d'un guide PDF ; (2) la livraison par email du guide PDF et l'envoi postal d'une carte mémoire physique préparée par nos soins.",
  ],
  [
    "3. Prix et paiement",
    "Les prix sont indiqués en euros, toutes taxes comprises. Le paiement s'effectue en ligne par carte bancaire (Stripe) ou PayPal, au moment de la commande.",
  ],
  [
    "4. Livraison des contenus numériques",
    "Le guide PDF et, le cas échéant, les fichiers d'activation sont transmis par email à l'adresse renseignée lors de la commande, immédiatement après confirmation du paiement, via un lien de téléchargement personnel valable 30 jours.",
  ],
  [
    "5. Livraison physique",
    "Pour la formule incluant une carte mémoire physique, celle-ci est expédiée à l'adresse postale renseignée lors de la commande, sous un délai indicatif de [X jours ouvrés — à compléter], via [nom du transporteur — à compléter].",
  ],
  [
    "6. Droit de rétractation",
    "Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour la fourniture d'un contenu numérique non fourni sur un support matériel dont l'exécution a commencé après accord préalable exprès du consommateur. [Cette clause doit être adaptée avec un professionnel du droit avant mise en ligne.]",
  ],
  [
    "7. Responsabilité",
    "[À compléter : limites d'usage, compatibilité selon véhicule/autoradio, garanties applicables.]",
  ],
  ["8. Contact", "[Email et/ou téléphone de contact du service client — à compléter]"],
];

export default function CGVPage() {
  return (
    <>
      <Header />
      <section className="container legal-section w-720">
        <h1 className="checkout-title">Conditions générales de vente</h1>

        <div className="stack-24">
          {SECTIONS.map(([title, text]) => (
            <div key={title}>
              <h3 className="legal-h3">{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>

        <p className="legal-warning">
          ⚠️ Ce texte est un modèle de départ, pas un document juridique validé. Fais-le relire par un
          professionnel (avocat, expert-comptable) avant la mise en ligne réelle du site.
        </p>
      </section>
      <Footer />
    </>
  );
}
