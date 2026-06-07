# Mia

Site statique pour présenter les livres pour enfants de Mia, par exemple
**Mia à Biarritz** et **Mia à Anglet**.

## Fichiers

- `index.html` : contenu de la page.
- `styles.css` : couleurs, mise en page responsive et police d'affichage.
- `assets/covers/` : couvertures exportées depuis le PDF, une image par livre.

## Livres affichés

La page présente les couvertures comme des livres à acheter, avec un prix
indicatif et un bouton `Acheter` qui pointe vers le contact email. Remplacez
ensuite ce lien par une vraie page de paiement si besoin.

## Police Cubano Spark

La page utilise `Cubano Spark` en priorité pour les titres :

```css
font-family: "Cubano Spark", "Cubano", "Cooper Black", "Arial Black", sans-serif;
```

Pour afficher exactement cette police sur tous les appareils, ajoutez le fichier
webfont sous licence dans le dépôt, puis remplacez la règle `@font-face` de
`styles.css` par un chargement du fichier, par exemple :

```css
@font-face {
  font-family: "Cubano Spark";
  src: url("assets/fonts/cubano-spark.woff2") format("woff2");
  font-display: swap;
}
```

## Publication GitHub Pages

Dans les réglages GitHub du dépôt, activez **Pages** avec la branche `main` et le
dossier racine (`/`). GitHub servira automatiquement `index.html`.
