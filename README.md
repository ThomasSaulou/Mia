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
indicatif et un bouton `Pré-commander` qui pointe vers le contact email. Remplacez
ensuite ce lien par une vraie page de paiement si besoin.

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

## Logo Maison Ipuin (historique)

Le header utilise pour l'instant un logo texte provisoire `MI`. Quand le logo
officiel sera disponible, ajoutez-le au dépôt et remplacez ce bloc dans
`index.html`.

## Publication GitHub Pages

Dans les réglages GitHub du dépôt, activez **Pages** avec la branche `main` et le
dossier racine (`/`). GitHub servira automatiquement `index.html`.
