# Maison Ipuin - Collection Mia

Site statique de la maison d'édition **Maison Ipuin** pour présenter en pré-commande
la collection de livres jeunesse **Mia**.

## Fichiers

- `index.html` : contenu de la page.
- `styles.css` : design chaleureux (crème, terracotta, turquoise), mise en page
  responsive et grille catalogue.
- `assets/covers/` : couvertures exportées depuis le PDF, une image par livre.

## Direction artistique

La palette et la typographie sont inspirées des couvertures Mia :

- **Couleurs** : crème en fond, terracotta (la robe de Mia) pour les actions,
  turquoise océan en accent et jaune soleil pour les touches lumineuses.
- **Typographie** : `Fraunces` (serif expressive) pour les titres et
  `Nunito Sans` (sans humaniste) pour le texte et les boutons, chargées via
  Google Fonts, avec des polices système en fallback.
- **Composants** : boutons arrondis « pill » avec dégradé et léger relief au
  survol, cartes livres en papier crème avec ombre douce, en-tête flottant.

## Livres affichés

La page présente les couvertures comme des livres en pré-commande, avec un prix
indicatif et un bouton `Pré-commander` qui pointe vers le contact email. Remplacez
ensuite ce lien par une vraie page de paiement si besoin.

## Logo Maison Ipuin

Le header utilise pour l'instant un logo texte provisoire `MI`. Quand le logo
officiel sera disponible, ajoutez-le au dépôt et remplacez ce bloc dans
`index.html`.

## Publication GitHub Pages

Dans les réglages GitHub du dépôt, activez **Pages** avec la branche `main` et le
dossier racine (`/`). GitHub servira automatiquement `index.html`.
