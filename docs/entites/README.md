# Kit entités — Maison Ipuin

Fiches prêtes à copier-coller pour inscrire Maison Ipuin et la collection Mia
dans les bases de données du livre et les plateformes externes.

## Wikidata — Maison Ipuin (éditeur)

Créer un item `Maison Ipuin` :

| Propriété | Valeur |
|---|---|
| instance of (P31) | book publisher (Q2085381) |
| country (P17) | France (Q142) |
| located in (P131) | Pays basque / Pyrénées-Atlantiques |
| official website (P856) | https://maisonipuin.fr |
| genre (P136) | children's literature (Q131539) |
| product or material produced (P1056) | children's book (Q10648343) |

Description : « maison d'édition jeunesse française spécialisée dans les livres pour enfants sur le Pays basque »

## Wikidata — livres Mia (un item par titre)

Pour chaque livre (ex. Mia à Biarritz) :

| Propriété | Valeur |
|---|---|
| instance of (P31) | book (Q571) |
| title (P1476) | Mia à Biarritz |
| language of work (P407) | French (Q150) |
| publisher (P123) | Maison Ipuin (item créé ci-dessus) |
| part of the series (P179) | Collection Mia |
| narrative location (P840) | Biarritz (Q191956) |
| genre (P136) | picture book (Q10648343) |
| intended public (P2360) | child (Q41323) |
| official website (P856) | https://maisonipuin.fr/livres/mia-a-biarritz/ |

Répéter pour les 16 titres en adaptant le lieu narratif.

## Goodreads

Pour chaque livre :

- **Title** : Mia à Biarritz
- **Author** : Maison Ipuin (ou nom d'auteur si applicable)
- **ISBN** : à compléter après attribution
- **Publisher** : Maison Ipuin
- **Published** : année de parution
- **Format** : Paperback
- **Pages** : 24
- **Description** : reprendre `descriptionLong` depuis `data/books-extra.json`

## Open Library

Créer une édition par livre :

```json
{
  "title": "Mia à Biarritz",
  "publishers": ["Maison Ipuin"],
  "publish_date": "2026",
  "number_of_pages": 24,
  "subjects": ["Children's stories", "Basque Country", "Biarritz"],
  "description": "Mia part à la découverte de l'océan..."
}
```

## Amazon / KDP

Titres optimisés (exemples) :

- `Mia à Biarritz – Livre enfant Pays basque | Collection Mia`
- `Mia à Bayonne – Idée cadeau enfant 2-8 ans | Pays basque`

Description (7 premières lignes cruciales) :

> Mia à Biarritz est un livre illustré pour enfants de 2 à 8 ans.
> La petite héroïne découvre l'océan, le Rocher de la Vierge et les ruelles colorées.
> Idée cadeau locale parfaite pour une famille de Biarritz.
> Collection Mia – Maison Ipuin, maison d'édition jeunesse du Pays basque.
> Format 15,24 x 15,24 cm, 24 pages couleur.

Mots-clés backend : livre enfant, Pays basque, Biarritz, idée cadeau, livre illustré

## Pinterest

Épingle par couverture :

- **Titre** : Mia à Biarritz – Livre enfant Pays basque
- **Description** : Idée cadeau locale pour enfant 2-8 ans. Collection Mia par Maison Ipuin. #livreenfant #paysbasque #biarritz #ideecadeau
- **Lien** : https://maisonipuin.fr/livres/mia-a-biarritz/
- **Image** : assets/covers/mia-a-biarritz.webp

## YouTube — script feuilletage (30 s)

> « Voici Mia à Biarritz, un livre pour enfants sur le Pays basque.
> Mia découvre la Grande Plage, le Rocher de la Vierge et les ruelles de Biarritz.
> Collection Mia, 24 pages couleur, dès 9,99 € sur maisonipuin.fr. »
