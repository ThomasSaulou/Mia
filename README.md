# Maison Ipuin - Collection Mia

Site statique de la maison d'édition **Maison Ipuin** pour présenter en pré-commande
la collection de livres jeunesse **Mia**.

## Fichiers

- `index.html` : contenu de la page + petit script d'apparition au défilement.
- `styles.css` : design éditorial épuré (Apple x Medium), mise en page
  responsive et grille catalogue.
- `format-livre-kdp.md` : décision de format pour les premiers livres KDP.
- `data/stripe-books.json` : catalogue source utilisé pour créer les produits
  et liens de paiement Stripe.
- `data/stripe-links.json` : liens Stripe publics utilisés par les boutons du
  site une fois générés.
- `scripts/create-stripe-payment-links.mjs` : script local de création des
  produits, prix et Payment Links Stripe.
- `assets/covers/` : couvertures exportées depuis le PDF, une image par livre.
- `skills/frontend-design/SKILL.md` : skill de design front suivi pour la refonte.

## Direction artistique

Minimalisme éditorial raffiné : le décor reste neutre et clair pour laisser les
couvertures, très colorées, faire le spectacle. La couleur revient par petites
touches pour garder l'esprit jeunesse.

- **Couleurs** : fond neutre clair (pas de couleur dominante), texte presque
  noir chaud, et terracotta (la robe de Mia) en accent ; turquoise pour le focus.
- **Typographie** : `Fraunces` (serif expressive, en italique pour les accents)
  pour les titres et `Hanken Grotesk` (sans raffinée) pour le texte et l'UI,
  chargées via Google Fonts, avec des polices système en fallback.
- **Détails** : grain papier très discret, filets fins, ombres très douces,
  boutons « pill » sobres, liens à flèche animée et apparition orchestrée au
  chargement et au défilement (désactivée si `prefers-reduced-motion`).

## Livres affichés

La page présente les couvertures comme des livres en pré-commande, avec un prix
indicatif et un bouton `Pré-commander`. Le hero met en avant un visuel
« collection » (plusieurs couvertures en éventail) plutôt qu'un seul livre, pour
ne pas faire doublon avec la première carte du catalogue. Le catalogue affiche
aussi le format retenu pour les premiers tests : 15,24 x 15,24 cm, 24 pages,
intérieur couleur, broché KDP.

## Vente avec Stripe Payment Links

Le site est prêt pour vendre avec **Stripe Payment Links**, sans backend et sans
exposer de clé secrète sur GitHub Pages.

1. Dans Stripe, créez une clé API restreinte avec les accès nécessaires :
   `Products` read/write, `Prices` read/write et `Payment Links` read/write.
2. Depuis le dépôt, lancez le script avec la clé en variable d'environnement :

   ```bash
   STRIPE_API_KEY="rk_live_..." node scripts/create-stripe-payment-links.mjs
   ```

3. Le script crée ou réutilise les produits, prix et liens Stripe pour les livres
   listés dans `data/stripe-books.json`.
4. Il écrit les URLs publiques dans `data/stripe-links.json`.
5. Déployez le site : les boutons `Pré-commander` redirigeront alors vers Stripe.

Le prix de lancement est configuré à **9,99 €** par livre dans
`data/stripe-books.json` (`unitAmount: 999`).

> Ne committez jamais de clé Stripe. La clé doit rester dans une variable
> d'environnement locale. Le fichier `.gitignore` ignore les fichiers `.env`.

### Fallback tant que Stripe n'est pas généré

Tant que `data/stripe-links.json` ne contient pas encore d'URLs Stripe, le clic
sur `Pré-commander` ouvre une fenêtre de précommande email. Ce fallback peut être
branché plus tard sur Formspree, Getform, Formspark, Basin ou Google Apps Script
si besoin.

## Mettre le vrai logo officiel

Le logo affiché (`assets/logo-maison-ipuin.svg`) est une reconstruction
provisoire. Pour utiliser le **vrai fichier** de la maison d'édition, deux
options (le fichier doit d'abord être ajouté au dépôt) :

**Option A — utiliser le PNG d'origine (fidélité 100%)**

1. Ajoute ton fichier sous `assets/logo-maison-ipuin.png`.
2. Dans `index.html`, remplace les `src=".../logo-maison-ipuin.svg"` par
   `.../logo-maison-ipuin.png` (header, section « La maison », footer, favicon).

**Option B — générer un SVG vectoriel fidèle depuis le PNG**

1. Ajoute ton fichier sous `assets/logo-source.png`.
2. Lance `bash scripts/trace-logo.sh` : il vectorise le logo et écrit
   `assets/logo-maison-ipuin.svg` (déjà référencé partout). Aucun autre
   changement nécessaire.

## Publication GitHub Pages

Dans les réglages GitHub du dépôt, activez **Pages** avec la branche `main` et le
dossier racine (`/`). GitHub servira automatiquement `index.html`.

### Domaine personnalisé

Le fichier `CNAME` configure GitHub Pages pour servir le site sur :

- `https://maisonipuin.fr`

Chez Namecheap, configurez les DNS du domaine avec :

| Type | Host | Value |
| --- | --- | --- |
| A Record | `@` | `185.199.108.153` |
| A Record | `@` | `185.199.109.153` |
| A Record | `@` | `185.199.110.153` |
| A Record | `@` | `185.199.111.153` |
| CNAME Record | `www` | `thomassaulou.github.io` |

La propagation DNS peut prendre de quelques minutes à 24 heures. Une fois le
domaine reconnu dans GitHub Pages, activez **Enforce HTTPS** si l'option n'est
pas déjà cochée.
