# CarPlayActiv — Site e-commerce par catalogue de véhicules

Site complet : vitrine, catalogue de véhicules géré par l'admin (marque/modèle/année,
photo, fichier, PDF, prix), tunnel de commande, paiement Stripe + PayPal, envoi
automatique du bon fichier par email après paiement, gestion de la carte physique,
espace client, espace admin avec droits complets (ajouter/modifier/supprimer).

Ce guide est pensé pour un débutant : **on teste tout en local d'abord**, puis on
héberge en ligne une fois que tout fonctionne.

---

## Partie A — Tester en local (avant tout hébergement)

Compte environ 30 minutes la première fois. Tu n'as besoin de payer nulle part :
tout ce qui suit est gratuit.

### A.1 — Installer les outils de base

1. Installe **Node.js** (version 20 ou plus) : https://nodejs.org (choisis la version "LTS")
2. Installe un éditeur de code si tu n'en as pas : https://code.visualstudio.com
3. Vérifie que Node est bien installé en ouvrant un terminal et en tapant :
   ```
   node -v
   ```
   Tu dois voir un numéro de version (ex: v20.11.0).

### A.2 — Créer une base de données (gratuite, 2 minutes)

Même pour tester en local, on utilise une vraie base Postgres gratuite (plus simple
et plus fiable qu'une base locale à installer soi-même) :

1. Va sur https://supabase.com et crée un compte (gratuit, pas de carte bancaire)
2. Crée un nouveau projet (choisis un mot de passe de base de données et note-le bien)
3. Une fois le projet créé, clique sur le bouton **Connect** en haut de la page
4. Dans l'onglet **ORM**, tu verras deux lignes à copier :
   - une variable `DATABASE_URL` (avec `:6543` et `?pgbouncer=true`)
   - une variable `DIRECT_URL` (avec `:5432`)
5. Garde ces deux valeurs de côté, on s'en sert à l'étape A.4

### A.3 — Installer le projet

1. Décompresse l'archive `carplay-shop.zip` que je t'ai fournie
2. Ouvre un terminal dans ce dossier (`cd chemin/vers/carplay-shop`)
3. Installe les dépendances :
   ```
   npm install
   ```
   (ça prend 1 à 2 minutes)

### A.4 — Configurer le fichier `.env`

1. Duplique le fichier `.env.example` et renomme la copie en `.env`
2. Ouvre `.env` et remplis :
   - `DATABASE_URL` et `DIRECT_URL` → colle les valeurs de Supabase (étape A.2)
   - `NEXTAUTH_SECRET` → une valeur aléatoire. Génère-la avec :
     ```
     node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
     ```
     et colle le résultat
   - `NEXTAUTH_URL` et `NEXT_PUBLIC_SITE_URL` → laisse `http://localhost:3000` pour l'instant
   - Laisse le reste (Stripe, PayPal, Resend) vide pour l'instant si tu veux juste voir
     le site tourner — on les remplira à l'étape A.7 pour tester les paiements

### A.5 — Créer les tables et les données de départ

Toujours dans le terminal, à la racine du projet :
```
npm run db:push
npm run db:seed
```
Le seed affiche dans le terminal l'email et le mot de passe de ton compte admin —
**note-les**. Il crée aussi 3 véhicules de démonstration (sans fichiers, à compléter
depuis l'admin).

### A.6 — Lancer le site

```
npm run dev
```
Ouvre http://localhost:3000 dans ton navigateur : le site tourne en local !

- Connecte-toi sur http://localhost:3000/admin/connexion avec le compte admin créé
  à l'étape A.5
- Va dans **Véhicules → Ajouter un véhicule** (ou modifie ceux de démo) : renseigne
  marque/modèle/année, uploade une photo, le fichier d'activation et le PDF, fixe
  les deux prix
- Retourne sur la page d'accueil, clique sur une formule : tu dois voir ton véhicule
  apparaître dans la liste

### A.7 — Tester un vrai paiement en local (optionnel mais recommandé)

**Stripe (carte bancaire) :**
1. Crée un compte gratuit sur https://dashboard.stripe.com/register (reste en mode **Test**)
2. Développeurs → Clés API → copie la clé secrète (`sk_test_...`) dans `STRIPE_SECRET_KEY`
3. Redémarre `npm run dev`
4. Passe une commande sur le site, choisis "Payer par carte", utilise le numéro de
   test `4242 4242 4242 4242`, une date future, n'importe quel CVC
5. Grâce à un contrôle de secours intégré au site, la commande est confirmée
   automatiquement même sans webhook configuré — pratique pour tester en local.
   (Pour la mise en production, configure quand même le vrai webhook, voir B.6)

**PayPal :**
1. Va sur https://developer.paypal.com/dashboard/applications, crée une app en mode **Sandbox**
2. Copie le Client ID dans `PAYPAL_CLIENT_ID` et `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, le secret dans `PAYPAL_CLIENT_SECRET`
3. Laisse `PAYPAL_ENV=sandbox`
4. Redémarre `npm run dev`, teste le paiement PayPal avec un compte "buyer" sandbox
   (Sandbox → Accounts dans ton dashboard PayPal Developer)

**Emails (Resend) :**
1. Crée un compte gratuit sur https://resend.com, crée une clé API → `RESEND_API_KEY`
2. Sans domaine vérifié, utilise `EMAIL_FROM="onboarding@resend.dev"` pour tester
   (fonctionne uniquement pour envoyer vers ta propre adresse Resend)
3. Redémarre `npm run dev`, passe une commande, vérifie que l'email arrive

### A.8 — Explorer la base de données visuellement (optionnel)

```
npm run db:studio
```
Ouvre une interface web pour voir/modifier directement les tables (véhicules,
commandes, comptes...). Pratique pour comprendre comment tout est rangé.

---

## Partie B — Mettre le site en ligne (une fois que tout fonctionne en local)

### B.1 — Mettre le code sur GitHub

```
git init
git add .
git commit -m "Site initial"
git branch -M main
git remote add origin https://github.com/TON-COMPTE/carplay-shop.git
git push -u origin main
```

### B.2 — Déployer sur Vercel

1. Va sur https://vercel.com/new et importe ton dépôt GitHub
2. Avant de cliquer "Deploy", ajoute dans **Environment Variables** toutes les
   valeurs de ton fichier `.env` (les mêmes que tu as testées en local)
3. Clique sur **Deploy**
4. Une fois en ligne, note l'URL fournie (ex: `https://carplay-shop.vercel.app`),
   remplace `NEXTAUTH_URL` et `NEXT_PUBLIC_SITE_URL` par cette URL dans les
   Environment Variables de Vercel, puis redéploie (Deployments → ⋯ → Redeploy)

### B.3 — Base de données de production

Tu peux réutiliser le même projet Supabase qu'en local (le catalogue et les
commandes seront communs), ou en créer un second projet Supabase dédié à la
production si tu préfères séparer test et réel — dans ce cas, refais `npm run
db:push` et `npm run db:seed` en pointant sur la nouvelle base.

### B.4 — Passer Stripe en mode réel

1. Dans le dashboard Stripe, active ton compte (infos entreprise, IBAN)
2. Repasse en mode **Live**, récupère les clés `sk_live_...`
3. Mets à jour `STRIPE_SECRET_KEY` sur Vercel

### B.5 — Passer PayPal en mode réel

1. Crée une app **Live** sur https://developer.paypal.com/dashboard/applications
   (nécessite un compte PayPal Business vérifié)
2. Mets à jour les clés sur Vercel, `PAYPAL_ENV=live`

### B.6 — Configurer le webhook Stripe (recommandé en production)

1. Stripe → Développeurs → Webhooks → Ajouter un endpoint
2. URL : `https://ton-site.vercel.app/api/webhooks/stripe`
3. Événement : `checkout.session.completed`
4. Copie le "Signing secret" (`whsec_...`) → `STRIPE_WEBHOOK_SECRET` sur Vercel, puis redéploie

### B.7 — Domaine, emails, CGV

- Branche ton nom de domaine dans Vercel (Project Settings → Domains)
- Vérifie ton domaine sur Resend pour envoyer depuis `commandes@tondomaine.fr`
- Personnalise et fais valider par un professionnel la page `/cgv`

---

## Nouveautés

- **PDF et fichiers d'activation séparés par formule** : dans `/admin/vehicules/[id]`,
  chaque véhicule a 4 zones de fichiers distinctes — Photos (communes), PDF Formule 1,
  PDF Formule 2, Fichiers d'activation Formule 1 (livrés au client), Fichiers
  d'activation Formule 2 (usage interne admin, pour préparer la carte physique).
  Upload multiple partout, suppression fichier par fichier.
- **Facture PDF automatique** : générée à partir des données de la commande (aucun
  upload), jointe à l'email de confirmation, téléchargeable depuis la page de
  téléchargement, l'espace client et le panneau admin.
- **Activer/désactiver un moyen de paiement** : `/admin/parametres`.
- **Espace client enrichi** : accès direct aux 2 formules, historique des
  commandes avec statuts ("En préparation" → "Expédiée"), factures téléchargeables.
- **Changement de mot de passe en self-service** : `/compte` pour les clients,
  `/admin/mon-compte` pour l'admin.
- **Gestion des utilisateurs** : `/admin/utilisateurs`, avec suppression de compte
  (impossible de supprimer un compte admin par erreur).
- **Section Contact** sur l'accueil (email + Facebook), configurable via `.env`
  (`NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_FACEBOOK`).
- **Important** : PayPal et la carte bancaire n'apparaissent/fonctionnent que si tu as
  rempli les vraies clés dans `.env` (voir Partie A.7). Sans ça, c'est normal qu'ils
  ne fassent rien — et le site affiche maintenant un message d'erreur clair dans ce cas
  plutôt que de rester silencieux. L'étape de saisie de la carte bancaire se fait sur
  la page sécurisée de Stripe (redirection) : c'est volontaire, jamais notre propre
  site ne doit collecter un numéro de carte directement (obligation légale PCI-DSS).

## Mettre à jour une base Supabase déjà créée avec l'ancien schéma

Le schéma a de nouveau changé (tables `VehicleActivationFile`, `OrderActivationFile`,
colonne `formula` sur les PDF). Comme tu es encore en phase de test :
1. Exécute `supabase-reset.sql` dans le SQL Editor Supabase
2. Exécute `supabase-init.sql` (version à jour, fournie avec cette archive)
3. Relance `npm run db:seed`, puis `npm run admin:set -- ...` si besoin



C'est le cœur du site : chaque **véhicule** (marque + modèle + année) a sa propre
fiche, gérée entièrement par l'admin depuis `/admin/vehicules` :

- **Ajouter** un véhicule : bouton "+ Ajouter un véhicule", renseigne marque, modèle,
  année, une description optionnelle (cas particuliers), une photo, le fichier
  d'activation, le guide PDF, et les deux prix (fichiers seuls / carte physique)
- **Modifier** : change n'importe quel champ à tout moment, y compris les prix
  (les commandes déjà payées gardent le prix payé à l'époque) ou remplace un fichier
- **Supprimer** : bouton rouge "Supprimer ce véhicule" dans la fiche — les commandes
  déjà passées pour ce véhicule ne sont pas affectées (elles gardent leur propre
  copie du PDF/fichier)
- **Masquer** sans supprimer : décoche "Visible sur le site" pour retirer
  temporairement un véhicule de la vente sans perdre ses fichiers

Le client, lui : clique sur une formule → arrive sur une page de sélection avec
recherche et photos → choisit son véhicule exact → passe commande → reçoit après
paiement uniquement le fichier et le PDF correspondant à SON véhicule.

Pour la formule "carte physique", le client ne reçoit jamais le fichier
d'activation par téléchargement (seulement le PDF) : le fichier reste accessible
uniquement à l'admin, depuis la fiche de la commande, pour préparer la carte à
envoyer.

---

## Structure du projet

```
src/app/
  page.tsx                       Accueil (2 formules + section Contact)
  vehicules/                     Sélection du véhicule (marque/modèle/année, recherche, photos)
  checkout/                      Tunnel de commande
  commande/confirmation/         Page après paiement (avec filet de sécurité Stripe)
  telechargement/[token]/        Téléchargement sécurisé (PDF, fichiers, facture — selon la formule)
  compte/                        Connexion / inscription / espace client (historique, mot de passe)
  admin/
    page.tsx                     Liste des commandes + statistiques
    commandes/[id]/               Détail commande, expédition, fichiers source, statut, facture
    vehicules/                    Liste, ajout, édition/suppression des véhicules (par formule)
    utilisateurs/                 Liste des comptes clients, suppression
    parametres/                   Activer/désactiver Stripe et PayPal
    mon-compte/                   Changer son mot de passe admin
  api/                           Toutes les routes serveur (commandes, paiement, webhooks, admin...)
src/lib/                         Stripe, PayPal, emails, factures, tokens, auth, finalisation de commande
prisma/schema.prisma             Modèle de données (User, Vehicle, Order, fichiers par formule)
prisma/seed.ts                   Compte admin + véhicules de démonstration
```

## Note technique importante

Ce projet n'a pas pu être testé de bout en bout dans l'environnement où il a été
généré (accès réseau restreint à certains services de Prisma). Le code a été
relu et vérifié manuellement (imports, routes, cohérence des données), mais
**suis bien la Partie A ci-dessus pour vérifier toi-même que tout fonctionne**
avant de passer à l'hébergement. Si une étape bloque, montre-moi le message
d'erreur exact et je corrige.

## Support

Le code est commenté en français aux endroits clés. Pour toute modification
(design, champs supplémentaires, règles de prix...), reviens vers moi avec une
demande précise.
