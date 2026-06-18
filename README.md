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
- `data/site.json` : configuration globale (domaine, email, collection).
- `data/books-extra.json` : textes longs, FAQ et métadonnées par livre.
- `data/cities.json` : communes du Pays basque (avec ou sans livre dédié).
- `data/occasions.json` : pages idées cadeau (naissance, anniversaire…).
- `scripts/build-site.mjs` : générateur de pages SEO (livres, villes, occasions).
- `scripts/validate-build.mjs` : vérifie que chaque page a assez de contenu.
- `scripts/create-stripe-payment-links.mjs` : script local de création des
  produits, prix et Payment Links Stripe.
- `livres/`, `villes/`, `idees-cadeau/` : pages HTML générées (ne pas éditer à la main).
- `products.json`, `llms-full.txt` : flux machine-readable pour les IA.
- `docs/entites/` : kit Wikidata, Goodreads, Amazon, Pinterest, YouTube.
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

## Génération des pages SEO

Après toute modification de `data/*.json` ou des scripts, regénérer le site :

```bash
node scripts/build-site.mjs
node scripts/validate-build.mjs
```

Le build génère automatiquement :

- **16 pages livre** (`/livres/mia-a-biarritz/`…) avec JSON-LD `Book`, FAQ et liens Stripe
- **38 pages ville** (`/villes/biarritz/`…) dont 22 communes sans livre dédié (recommandation honnête du titre le plus proche)
- **5 pages occasion** + **80 variantes ville×occasion** (`/idees-cadeau/cadeau-naissance-biarritz/`…)
- **`sitemap.xml`** (~143 URLs), **`llms.txt`**, **`llms-full.txt`**, **`products.json`**
- Mise à jour de `index.html` (liens catalogue, JSON-LD, email)

La CI GitHub (`.github/workflows/build.yml`) vérifie que les fichiers générés sont à jour.

## Référencement (SEO) & moteurs IA (GEO)

Le site est optimisé pour être trouvé à la fois par Google et par les moteurs de
réponse IA (ChatGPT/SearchGPT, Perplexity, Claude, Gemini…) sur des requêtes
comme « idée cadeau enfant Pays basque », « livre enfant » ou « livre Pays
basque ».

Ce qui est en place :

- **Balises `<head>` complètes** : `title` et `description` ciblés sur les
  mots-clés, `keywords`, `canonical`, `robots`, `theme-color`, balises géo
  (`geo.region`, `geo.position`), Open Graph et Twitter Card.
- **Données structurées Schema.org** (JSON-LD) : `Organization`, `WebSite`,
  `BookSeries`, une `ItemList` des 16 livres (`Book` + `Offer` à 9,99 €) et une
  `FAQPage`. Ces données aident Google (rich results) et donnent aux IA des faits
  fiables à citer.
- **Contenu sémantique** : section « Idée cadeau », section FAQ (questions =
  requêtes réelles), textes et `alt` d'images enrichis en mots-clés.
- **`robots.txt`** : autorise explicitement les robots IA (GPTBot, OAI-SearchBot,
  ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended, Applebot-Extended…) et
  référence le sitemap.
- **`sitemap.xml`** : ~143 URLs (accueil, livres, villes, occasions, images).
- **`llms.txt`** et **`llms-full.txt`** : fiches lisibles par les IA.
- **`products.json`** : flux produit JSON (prix, URLs, villes).
- **Pages programmatiques** avec contenu unique (pas de pages vides) : chaque page
  a au moins 180 mots de texte visible, une FAQ ou des conseils, et du maillage interne.
- **Leviers GEO prouvés** (étude Princeton/KDD 2024, +40 à +115 % de citations IA) :
  - **Réponse directe en tête de page** (`.answer-box` « En bref ») : ~44 % des
    citations IA proviennent des premiers 30 % d'une page → on y place une réponse
    factuelle de 40-80 mots.
  - **Densité de faits** : chiffres concrets dans la réponse (nombre de titres,
    tranche d'âge, pages, prix, distance) plutôt que des formules vagues.
  - **Citation attribuée** (`.pull-quote`) sur les pages livre/ville.

### Indexation instantanée Bing → ChatGPT (IndexNow)

ChatGPT Search s'appuie à **~87 % sur l'index de Bing** (analyses Seer/Profound).
Le dépôt notifie donc Bing automatiquement via le protocole **IndexNow** :

- **Clé** : `data/site.json` → `indexNowKey`, hébergée à la racine du domaine dans
  `b7d9f2a4c6e80135a7c9e1b3d5f70824.txt` (publique, ce n'est pas un secret).
- **Script** : `scripts/indexnow-submit.mjs` lit le `sitemap.xml` et envoie toutes
  les URLs à `api.indexnow.org` (qui redistribue à Bing, Yandex, Naver…).
- **Automatisation** : `.github/workflows/indexnow.yml` exécute la soumission à
  chaque `push` sur `main` qui touche le contenu (après un délai de publication
  Pages). Déclenchable aussi à la main (« Run workflow »).

Pour **changer la clé** : générez-en une nouvelle (8-128 caractères hexa), mettez
à jour `data/site.json` **et** renommez le fichier `*.txt` à la racine en
conséquence.

### Vérification Bing Webmaster Tools

1. Allez sur [Bing Webmaster Tools](https://www.bing.com/webmasters), ajoutez
   `https://maisonipuin.fr`.
2. Choisissez la vérification par **balise meta**, copiez le code.
3. Collez-le dans `data/site.json` → `bingVerification` (ex. `"1234ABCD…"`),
   relancez `node scripts/build-site.mjs`, commitez. La balise `msvalidate.01`
   apparaît alors sur toutes les pages.
4. Soumettez le `sitemap.xml`. (IndexNow accélère ensuite tout le reste.)

### Étapes manuelles recommandées (hors code)

Pour rendre le référencement réellement « imbattable », ces actions externes sont
à faire une fois le site déployé :

1. **Google Search Console** : ajouter `maisonipuin.fr`, soumettre
   `sitemap.xml`, demander l'indexation.
2. **Bing Webmaster Tools** : vérifier le site (voir ci-dessus) — clé pour ChatGPT.
   L'indexation continue est déjà automatisée via IndexNow.
3. **Google Business Profile** : créer une fiche « Maison Ipuin » (éditeur, Pays
   basque) pour le SEO local.
4. **Backlinks & citations** : être cité sur des sites locaux (offices de
   tourisme, blogs parents, librairies basques, presse locale) — c'est le levier
   le plus fort pour que les IA recommandent le site.
5. **Avis clients** une fois les ventes lancées (preuve sociale + signaux SEO).

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
