# Maison Ipuin - Collection Mia

Site statique de la maison d'édition **Maison Ipuin** pour présenter en pré-commande
la collection de livres jeunesse **Mia**.

## Fichiers

- `index.html` : contenu de la page + petit script d'apparition au défilement.
- `styles.css` : design éditorial épuré (Apple x Medium), mise en page
  responsive et grille catalogue.
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
ne pas faire doublon avec la première carte du catalogue.

## Pré-commande : collecte des emails

Au clic sur `Pré-commander`, une fenêtre s'ouvre et demande l'email du visiteur
(le titre du livre est repris automatiquement). Les adresses sont **rangées dans
un tableau de bord** ; aucun mail ne part du téléphone du visiteur.

Il suffit de brancher un service de formulaire gratuit. Le plus simple est
[Formspree](https://formspree.io) :

1. Créez un compte gratuit sur formspree.io.
2. **New form** → donnez un nom (ex. « Pré-commandes Mia ») → copiez l'URL du
   formulaire : `https://formspree.io/f/xxxxxxx`.
3. Dans `index.html`, dans le second bloc `<script>`, collez cette URL :

   ```js
   var PREORDER_ENDPOINT = "https://formspree.io/f/xxxxxxx";
   ```

C'est tout. Chaque pré-commande envoie `{ email, livre }` à Formspree, qui les
liste dans votre tableau de bord (exportable en CSV) et peut vous notifier par
email à chaque nouvelle inscription.

> Tant que `PREORDER_ENDPOINT` est vide, la fenêtre s'ouvre mais l'envoi affiche
> « collecte pas encore activée ». N'importe quel service acceptant un POST JSON
> fonctionne aussi (Getform, Formspark, Basin, Google Apps Script…).

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
