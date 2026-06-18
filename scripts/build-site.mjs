#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  absoluteUrl,
  assetPrefix,
  bookUrl,
  cityUrl,
  escapeHtml,
  formatPrice,
  occasionUrl,
  renderAnswerBox,
  renderBookCard,
  renderBreadcrumbs,
  renderFaq,
  renderPage,
  renderPullQuote,
  setSiteDomain,
} from "./lib/html.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BUILD_DATE = new Date().toISOString().slice(0, 10);

async function readJson(relativePath) {
  const raw = await readFile(path.join(ROOT, relativePath), "utf8");
  return JSON.parse(raw);
}

async function writeOutput(relativePath, content) {
  const fullPath = path.join(ROOT, relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content, "utf8");
}

function mergeBooks(catalog, extra, stripeLinks) {
  const linksBySlug = Object.fromEntries(
    (stripeLinks.links || []).map((link) => [link.slug, link.url])
  );

  return catalog.books.map((book) => {
    const details = extra[book.slug];
    if (!details) {
      throw new Error(`Missing books-extra entry for ${book.slug}`);
    }
    return {
      ...book,
      ...details,
      unitAmount: catalog.unitAmount,
      currency: catalog.currency,
      format: catalog.format,
      pages: catalog.pages,
      interior: catalog.interior,
      collection: catalog.collection,
      stripeUrl: linksBySlug[book.slug] || null,
    };
  });
}

function bookBySlug(books, slug) {
  const book = books.find((item) => item.slug === slug);
  if (!book) throw new Error(`Unknown book slug: ${slug}`);
  return book;
}

function cityBySlug(cities, slug) {
  const city = cities.find((item) => item.slug === slug);
  if (!city) throw new Error(`Unknown city slug: ${slug}`);
  return city;
}

function renderBookPage(book, books, site) {
  const depth = 2;
  const prefix = assetPrefix(depth);
  const canonicalPath = bookUrl(book.slug);
  const title = `${book.title} — livre enfant Pays basque | ${site.name}`;
  const description = `${book.title} : ${book.description} Idée cadeau locale pour enfants de 2 à 8 ans. ${formatPrice(book.unitAmount)}, collection Mia.`;
  const related = book.relatedSlugs.map((slug) => bookBySlug(books, slug));

  const answer = `<strong>${escapeHtml(book.title)}</strong> est un livre pour enfant de la collection Mia (éditions ${escapeHtml(site.name)}), dédié à <strong>${escapeHtml(book.city)}</strong>, au Pays basque. Album illustré pour les ${site.collection.ageMin}-${site.collection.ageMax} ans, ${escapeHtml(book.pages)} en ${escapeHtml(book.interior)}, format ${escapeHtml(book.format)}, au prix de <strong>${escapeHtml(formatPrice(book.unitAmount))}</strong>. Une idée cadeau locale idéale pour une naissance, un anniversaire ou Noël.`;

  const buyCta = book.stripeUrl
    ? `<a class="button button-large" href="${escapeHtml(book.stripeUrl)}">Pré-commander — ${escapeHtml(formatPrice(book.unitAmount))}</a>`
    : `<a class="button button-large" href="${prefix}index.html#contact">Pré-commander — ${escapeHtml(formatPrice(book.unitAmount))}</a>`;

  const content = `
      <article class="page-hero reveal in">
        <div class="page-hero-grid">
          <div class="page-hero-media">
            <img src="${prefix}assets/covers/${book.slug}.webp" alt="Couverture de ${escapeHtml(book.title)}, livre pour enfant sur ${escapeHtml(book.city)}" width="900" height="900">
          </div>
          <div class="page-hero-copy">
            <p class="eyebrow">Collection Mia · ${escapeHtml(book.city)}</p>
            <h1>${escapeHtml(book.title)}</h1>
            <p class="lead">${escapeHtml(book.descriptionLong)}</p>
            <ul class="feature-list">
              ${book.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n              ")}
            </ul>
            <p class="meta-line">Format ${escapeHtml(book.format)} · ${escapeHtml(book.pages)} · ${escapeHtml(book.interior)} · ${escapeHtml(formatPrice(book.unitAmount))}</p>
            ${buyCta}
          </div>
        </div>
      </article>
${renderAnswerBox(answer)}

      <section class="section page-section reveal in">
        <div class="section-heading">
          <p class="eyebrow">Idée cadeau</p>
          <h2>Un livre enfant pour ${escapeHtml(book.city)}</h2>
        </div>
        <div class="prose">
          <p>
            Offrir <strong>${escapeHtml(book.title)}</strong>, c'est offrir un morceau du Pays basque à un enfant de 2 à 8 ans.
            Que ce soit pour une naissance, un anniversaire ou Noël, un livre local a plus de sens qu'un jouet générique :
            l'enfant (ou la famille) s'y reconnaît.
          </p>
          ${renderPullQuote(
            "Chaque livre Mia est dédié à une ville du Pays basque : l'idée cadeau la plus locale qui soit pour un enfant.",
            `${site.name}, maison d'édition jeunesse`
          )}
          <p>${escapeHtml(book.cityIntro)}</p>
          <p>
            Découvrez aussi notre page
            <a href="${prefix}villes/${book.citySlug}/">livre enfant ${escapeHtml(book.city)}</a>
            et nos guides
            <a href="${prefix}idees-cadeau/cadeau-naissance/">cadeau de naissance</a>,
            <a href="${prefix}idees-cadeau/cadeau-anniversaire/">cadeau d'anniversaire</a>
            et <a href="${prefix}idees-cadeau/cadeau-noel/">cadeau de Noël</a>.
          </p>
        </div>
      </section>

      <section class="section page-section reveal in">
        <div class="section-heading">
          <p class="eyebrow">Questions</p>
          <h2>FAQ — ${escapeHtml(book.title)}</h2>
        </div>
        <div class="faq">
          ${renderFaq(book.faq)}
        </div>
      </section>

      <section class="section page-section reveal in">
        <div class="section-heading">
          <p class="eyebrow">À proximité</p>
          <h2>Autres livres Mia à découvrir</h2>
        </div>
        <div class="book-grid book-grid-compact">
          ${related.map((item) => renderBookCard(item, item.stripeUrl, depth)).join("\n")}
        </div>
      </section>`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Book",
        "@id": absoluteUrl(canonicalPath) + "#book",
        name: book.title,
        url: absoluteUrl(canonicalPath),
        description: book.descriptionLong,
        bookFormat: "https://schema.org/Paperback",
        inLanguage: "fr-FR",
        image: absoluteUrl(`/assets/covers/${book.slug}.webp`),
        author: { "@type": "Organization", name: site.name },
        publisher: { "@id": absoluteUrl("/#organization") },
        isPartOf: { "@id": absoluteUrl("/#collection-mia") },
        about: book.city,
        audience: {
          "@type": "PeopleAudience",
          suggestedMinAge: site.collection.ageMin,
          suggestedMaxAge: site.collection.ageMax,
        },
        offers: {
          "@type": "Offer",
          price: (book.unitAmount / 100).toFixed(2),
          priceCurrency: book.currency.toUpperCase(),
          availability: "https://schema.org/PreOrder",
          url: book.stripeUrl || absoluteUrl("/#contact"),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Catalogue", item: absoluteUrl("/livres/") },
          { "@type": "ListItem", position: 3, name: book.title, item: absoluteUrl(canonicalPath) },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: book.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return renderPage({
    site,
    depth,
    title,
    description,
    canonicalPath,
    ogImage: `/assets/covers/${book.slug}.webp`,
    jsonLd,
    breadcrumbs: renderBreadcrumbs(
      [
        { label: "Accueil", href: "/" },
        { label: "Catalogue", href: "/livres/" },
        { label: book.title, href: canonicalPath },
      ],
      depth
    ),
    content,
  });
}

function renderCityPage(city, books, cities, site) {
  const depth = 2;
  const prefix = assetPrefix(depth);
  const canonicalPath = cityUrl(city.slug);
  const nearestBook = bookBySlug(books, city.nearestBookSlug);
  const title = city.hasBook
    ? `Livre enfant ${city.name} — idée cadeau Pays basque | ${site.name}`
    : `Livre enfant ${city.name} — le plus proche : ${nearestBook.title} | ${site.name}`;
  const description = city.hasBook
    ? `Découvrez ${nearestBook.title}, le livre pour enfant dédié à ${city.name}. Idée cadeau locale pour les 2-8 ans, collection Mia à ${formatPrice(nearestBook.unitAmount)}.`
    : `Pas encore de Mia à ${city.name}, mais ${nearestBook.title} est le livre le plus proche (${city.nearestBookDistanceKm} km). Idée cadeau enfant Pays basque.`;

  const neighborCities = city.neighbors
    .map((slug) => cities.find((item) => item.slug === slug))
    .filter(Boolean);

  const citiesWithBookCount = cities.filter((item) => item.hasBook).length;
  const answer = city.hasBook
    ? `Pour offrir un <strong>livre enfant à ${escapeHtml(city.name)}</strong>, le titre Mia dédié est <strong>${escapeHtml(nearestBook.title)}</strong> : un album illustré pour les ${site.collection.ageMin}-${site.collection.ageMax} ans, ${escapeHtml(nearestBook.pages)}, au prix de <strong>${escapeHtml(formatPrice(nearestBook.unitAmount))}</strong>. ${escapeHtml(city.name)} fait partie des ${citiesWithBookCount} villes du Pays basque dotées d'un titre dédié (collection de ${books.length} livres).`
    : `Il n'existe pas encore de livre Mia dédié à <strong>${escapeHtml(city.name)}</strong>. Le titre le plus proche est <strong>${escapeHtml(nearestBook.title)}</strong>, à environ ${city.nearestBookDistanceKm} km : un album pour enfants de ${site.collection.ageMin}-${site.collection.ageMax} ans à <strong>${escapeHtml(formatPrice(nearestBook.unitAmount))}</strong>, idée cadeau locale au Pays basque.`;

  const content = city.hasBook
    ? `
      <article class="page-hero reveal in">
        <div class="page-hero-copy page-hero-copy-wide">
          <p class="eyebrow">Pays basque · ${escapeHtml(city.department)}</p>
          <h1>Livre enfant à ${escapeHtml(city.name)}</h1>
          <p class="lead">${escapeHtml(city.intro)}</p>
        </div>
      </article>

      <section class="section page-section reveal in">
        <div class="book-spotlight">
          ${renderBookCard(nearestBook, nearestBook.stripeUrl, depth, { linkTitle: false })}
        </div>
      </section>

      <section class="section page-section reveal in">
        <div class="section-heading">
          <p class="eyebrow">Pourquoi ce livre</p>
          <h2>${escapeHtml(nearestBook.title)} pour les familles de ${escapeHtml(city.name)}</h2>
        </div>
        <div class="prose">
          <p>${escapeHtml(nearestBook.descriptionLong)}</p>
          <p>
            ${escapeHtml(nearestBook.title)} est un album illustré de la collection Mia, pensé pour les enfants de
            ${site.collection.ageMin} à ${site.collection.ageMax} ans. Format ${escapeHtml(nearestBook.format)},
            ${escapeHtml(nearestBook.pages)} couleur, au prix de ${escapeHtml(formatPrice(nearestBook.unitAmount))}.
          </p>
        </div>
      </section>`
    : `
      <article class="page-hero reveal in">
        <div class="page-hero-copy page-hero-copy-wide">
          <p class="eyebrow">Pays basque · ${escapeHtml(city.department)}</p>
          <h1>Livre enfant à ${escapeHtml(city.name)}</h1>
          <p class="lead">${escapeHtml(city.intro)}</p>
        </div>
      </article>

      <section class="section page-section reveal in">
        <div class="section-heading">
          <p class="eyebrow">Collection Mia</p>
          <h2>Pas encore de Mia à ${escapeHtml(city.name)}</h2>
        </div>
        <div class="prose">
          <p>
            La collection Mia ne compte pas encore de titre exclusivement dédié à ${escapeHtml(city.name)}.
            En attendant, le livre le plus proche géographiquement est
            <a href="${prefix}livres/${nearestBook.slug}/">${escapeHtml(nearestBook.title)}</a>,
            à environ ${city.nearestBookDistanceKm} km.
          </p>
          <p>
            ${escapeHtml(nearestBook.descriptionLong)}
          </p>
          <p>
            C'est une excellente idée cadeau pour une famille de ${escapeHtml(city.name)} : un livre ancré dans le
            Pays basque, avec des illustrations colorées et un texte tendre à lire ensemble.
          </p>
        </div>
      </section>

      <section class="section page-section reveal in">
        <div class="book-spotlight">
          ${renderBookCard(nearestBook, nearestBook.stripeUrl, depth, { linkTitle: false })}
        </div>
      </section>`;

  const faq = city.hasBook
    ? [
        {
          q: `Quel livre offrir à un enfant de ${city.name} ?`,
          a: `${nearestBook.title} est le titre Mia dédié à ${city.name}. Disponible en pré-commande sur maisonipuin.fr à ${formatPrice(nearestBook.unitAmount)}.`,
        },
        {
          q: `Pour quel âge est ce livre ?`,
          a: `La collection Mia s'adresse aux enfants de ${site.collection.ageMin} à ${site.collection.ageMax} ans environ.`,
        },
      ]
    : [
        {
          q: `Existe-t-il un livre Mia pour ${city.name} ?`,
          a: `Pas encore de titre exclusivement dédié à ${city.name}. Le plus proche est ${nearestBook.title}, à environ ${city.nearestBookDistanceKm} km.`,
        },
        {
          q: `Pourquoi offrir ${nearestBook.title} à une famille de ${city.name} ?`,
          a: `C'est le livre Mia le plus proche géographiquement. Il parle du Pays basque avec tendresse et convient parfaitement comme cadeau de naissance ou d'anniversaire.`,
        },
      ];

  const neighborsSection =
    neighborCities.length > 0
      ? `
      <section class="section page-section reveal in">
        <div class="section-heading">
          <p class="eyebrow">Villes voisines</p>
          <h2>Explorer d'autres communes</h2>
        </div>
        <ul class="link-list">
          ${neighborCities
            .map(
              (item) =>
                `<li><a href="${prefix}villes/${item.slug}/">Livre enfant ${escapeHtml(item.name)}</a></li>`
            )
            .join("\n          ")}
        </ul>
      </section>`
      : "";

  const contentWithAnswer = content.replace(
    "</article>",
    `</article>\n${renderAnswerBox(answer)}`
  );

  const fullContent = `${contentWithAnswer}

      <section class="section page-section reveal in">
        <div class="section-heading">
          <p class="eyebrow">Questions</p>
          <h2>FAQ — ${escapeHtml(city.name)}</h2>
        </div>
        <div class="faq">
          ${renderFaq(faq)}
        </div>
      </section>
      ${neighborsSection}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": absoluteUrl(canonicalPath) + "#webpage",
        url: absoluteUrl(canonicalPath),
        name: title,
        description,
        about: {
          "@type": "Place",
          name: city.name,
          containedInPlace: { "@type": "Place", name: "Pays basque" },
        },
        mainEntity: {
          "@type": "Book",
          name: nearestBook.title,
          url: absoluteUrl(bookUrl(nearestBook.slug)),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Par ville", item: absoluteUrl("/villes/") },
          { "@type": "ListItem", position: 3, name: city.name, item: absoluteUrl(canonicalPath) },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return renderPage({
    site,
    depth,
    title,
    description,
    canonicalPath,
    ogImage: `/assets/covers/${nearestBook.slug}.webp`,
    jsonLd,
    breadcrumbs: renderBreadcrumbs(
      [
        { label: "Accueil", href: "/" },
        { label: "Par ville", href: "/villes/" },
        { label: city.name, href: canonicalPath },
      ],
      depth
    ),
    content: fullContent,
  });
}

function renderOccasionPage(occasion, books, site) {
  const depth = 2;
  const prefix = assetPrefix(depth);
  const canonicalPath = occasionUrl(occasion.slug);
  const featured = occasion.featuredSlugs.map((slug) => bookBySlug(books, slug));

  const answer = `${escapeHtml(occasion.title)} : un livre de la collection Mia est une <strong>idée cadeau locale</strong> pour un enfant de ${site.collection.ageMin}-${site.collection.ageMax} ans au Pays basque. ${books.length} titres disponibles, un par ville (Biarritz, Bayonne, Espelette…), à <strong>${escapeHtml(formatPrice(books[0].unitAmount))}</strong> l'album, en pré-commande sur ${escapeHtml(site.name)}.`;

  const content = `
      <article class="page-hero reveal in">
        <div class="page-hero-copy page-hero-copy-wide">
          <p class="eyebrow">Idée cadeau · Pays basque</p>
          <h1>${escapeHtml(occasion.title)}</h1>
          <p class="lead">${escapeHtml(occasion.intro)}</p>
        </div>
      </article>
${renderAnswerBox(answer)}

      <section class="section page-section reveal in">
        <div class="section-heading">
          <p class="eyebrow">Conseils</p>
          <h2>Comment choisir un livre Mia</h2>
        </div>
        <ul class="feature-list">
          ${occasion.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("\n          ")}
        </ul>
      </section>

      <section class="section page-section reveal in">
        <div class="section-heading">
          <p class="eyebrow">Sélection</p>
          <h2>Livres Mia recommandés</h2>
        </div>
        <div class="book-grid">
          ${featured.map((book) => renderBookCard(book, book.stripeUrl, depth)).join("\n")}
        </div>
      </section>

      <section class="section page-section reveal in">
        <div class="section-heading">
          <p class="eyebrow">Questions</p>
          <h2>FAQ — ${escapeHtml(occasion.title)}</h2>
        </div>
        <div class="faq">
          ${renderFaq(occasion.faq)}
        </div>
      </section>`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": absoluteUrl(canonicalPath) + "#webpage",
        url: absoluteUrl(canonicalPath),
        name: occasion.seoTitle,
        description: occasion.seoDescription,
        about: "Idée cadeau enfant Pays basque",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Idées cadeau", item: absoluteUrl("/idees-cadeau/") },
          { "@type": "ListItem", position: 3, name: occasion.title, item: absoluteUrl(canonicalPath) },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: occasion.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return renderPage({
    site,
    depth,
    title: `${occasion.seoTitle} | ${site.name}`,
    description: occasion.seoDescription,
    canonicalPath,
    ogImage: `/assets/covers/${featured[0].slug}.webp`,
    jsonLd,
    breadcrumbs: renderBreadcrumbs(
      [
        { label: "Accueil", href: "/" },
        { label: "Idées cadeau", href: "/idees-cadeau/" },
        { label: occasion.title, href: canonicalPath },
      ],
      depth
    ),
    content,
  });
}

function renderOccasionCityPage(occasion, city, books, site) {
  const depth = 2;
  const prefix = assetPrefix(depth);
  const slug = `${occasion.slug}-${city.slug}`;
  const canonicalPath = `/idees-cadeau/${slug}/`;
  const book = city.hasBook ? bookBySlug(books, city.bookSlug) : bookBySlug(books, city.nearestBookSlug);

  const title = `${occasion.title} à ${city.name} — livre enfant Pays basque | ${site.name}`;
  const description = `${occasion.title} à ${city.name} : offrez ${book.title}, livre illustré local pour enfants de 2 à 8 ans. Collection Mia, ${formatPrice(book.unitAmount)}.`;

  const answer = `${escapeHtml(occasion.title)} à ${escapeHtml(city.name)} : offrez <strong>${escapeHtml(book.title)}</strong>, un album Mia pour les ${site.collection.ageMin}-${site.collection.ageMax} ans à <strong>${escapeHtml(formatPrice(book.unitAmount))}</strong>. ${
    city.hasBook
      ? `Ce titre est entièrement dédié à ${escapeHtml(city.name)} : l'idée cadeau la plus locale possible.`
      : `C'est le livre le plus proche de ${escapeHtml(city.name)} (environ ${city.nearestBookDistanceKm} km).`
  }`;

  const content = `
      <article class="page-hero reveal in">
        <div class="page-hero-copy page-hero-copy-wide">
          <p class="eyebrow">${escapeHtml(occasion.title)} · ${escapeHtml(city.name)}</p>
          <h1>${escapeHtml(occasion.title)} à ${escapeHtml(city.name)}</h1>
          <p class="lead">
            Pour un ${escapeHtml(occasion.title.toLowerCase())} à ${escapeHtml(city.name)}, ${escapeHtml(book.title)}
            est un cadeau personnel et durable. ${escapeHtml(occasion.intro)}
          </p>
        </div>
      </article>
${renderAnswerBox(answer)}

      <section class="section page-section reveal in">
        <div class="book-spotlight">
          ${renderBookCard(book, book.stripeUrl, depth, { linkTitle: false })}
        </div>
      </section>

      <section class="section page-section reveal in">
        <div class="prose">
          <p>${escapeHtml(city.intro)}</p>
          <p>${escapeHtml(book.descriptionLong)}</p>
          ${
            city.hasBook
              ? `<p>Ce titre est entièrement dédié à ${escapeHtml(city.name)} : l'idée cadeau la plus locale possible.</p>`
              : `<p>En l'absence d'un titre Mia exclusivement dédié à ${escapeHtml(city.name)}, ${escapeHtml(book.title)} est le choix le plus proche (environ ${city.nearestBookDistanceKm} km).</p>`
          }
        </div>
      </section>

      <section class="section page-section reveal in">
        <div class="section-heading">
          <p class="eyebrow">Conseils</p>
          <h2>Bien choisir ce cadeau</h2>
        </div>
        <ul class="feature-list">
          ${occasion.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("\n          ")}
        </ul>
      </section>

      <section class="section page-section reveal in">
        <div class="prose">
          <p>
            Retrouvez aussi notre guide général
            <a href="${prefix}idees-cadeau/${occasion.slug}/">${escapeHtml(occasion.title)}</a>,
            la page <a href="${prefix}villes/${city.slug}/">livre enfant ${escapeHtml(city.name)}</a>
            et la fiche complète du livre
            <a href="${prefix}livres/${book.slug}/">${escapeHtml(book.title)}</a>.
          </p>
          <p>
            La collection Mia est éditée par ${escapeHtml(site.name)} : des albums illustrés pour les
            ${site.collection.ageMin}-${site.collection.ageMax} ans, format carré 15,24 cm, 24 pages couleur,
            au prix de ${escapeHtml(formatPrice(book.unitAmount))}.
          </p>
        </div>
      </section>`;

  return renderPage({
    site,
    depth,
    title,
    description,
    canonicalPath,
    ogImage: `/assets/covers/${book.slug}.webp`,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          url: absoluteUrl(canonicalPath),
          name: title,
          description,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Idées cadeau", item: absoluteUrl("/idees-cadeau/") },
            { "@type": "ListItem", position: 3, name: `${occasion.title} à ${city.name}`, item: absoluteUrl(canonicalPath) },
          ],
        },
      ],
    },
    breadcrumbs: renderBreadcrumbs(
      [
        { label: "Accueil", href: "/" },
        { label: "Idées cadeau", href: "/idees-cadeau/" },
        { label: `${occasion.title} à ${city.name}`, href: canonicalPath },
      ],
      depth
    ),
    content,
  });
}

function renderCatalogIndex(books, site) {
  const depth = 1;
  const content = `
      <article class="page-hero reveal in">
        <div class="page-hero-copy page-hero-copy-wide">
          <p class="eyebrow">Collection Mia</p>
          <h1>Catalogue des livres pour enfants</h1>
          <p class="lead">
            16 titres, 16 villes du Pays basque. Chaque album suit Mia dans une commune différente :
            un livre illustré tendre, une idée cadeau locale à ${escapeHtml(formatPrice(books[0].unitAmount))}.
          </p>
        </div>
      </article>
${renderAnswerBox(
    `La collection Mia compte <strong>${books.length} livres pour enfants</strong> sur le Pays basque, un titre par ville (Biarritz, Bayonne, Saint-Jean-de-Luz, Espelette…). Albums illustrés pour les ${site.collection.ageMin}-${site.collection.ageMax} ans, ${escapeHtml(books[0].pages)} couleur, à <strong>${escapeHtml(formatPrice(books[0].unitAmount))}</strong> l'unité. Idée cadeau locale en pré-commande sur ${escapeHtml(site.name)}.`
  )}

      <section class="section page-section reveal in">
        <div class="book-grid">
          ${books.map((book) => renderBookCard(book, book.stripeUrl, depth)).join("\n")}
        </div>
      </section>`;

  return renderPage({
    site,
    depth,
    title: `Catalogue — livres enfant Pays basque | ${site.name}`,
    description:
      "Les 16 livres de la collection Mia : un album illustré par ville du Pays basque. Livre enfant et idée cadeau locale dès 9,99 €.",
    canonicalPath: "/livres/",
    ogImage: "/assets/covers/mia-a-biarritz.webp",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Catalogue des livres Mia",
      url: absoluteUrl("/livres/"),
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: books.length,
        itemListElement: books.map((book, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(bookUrl(book.slug)),
          name: book.title,
        })),
      },
    },
    breadcrumbs: renderBreadcrumbs(
      [
        { label: "Accueil", href: "/" },
        { label: "Catalogue", href: "/livres/" },
      ],
      depth
    ),
    content,
  });
}

function renderCitiesIndex(cities, books, site) {
  const depth = 1;
  const withBook = cities.filter((city) => city.hasBook);
  const withoutBook = cities.filter((city) => !city.hasBook);

  const content = `
      <article class="page-hero reveal in">
        <div class="page-hero-copy page-hero-copy-wide">
          <p class="eyebrow">Pays basque</p>
          <h1>Livre enfant par ville</h1>
          <p class="lead">
            Trouvez un livre Mia pour la ville qui compte : ${withBook.length} communes avec un titre dédié,
            et des recommandations pour les autres villages du Pays basque.
          </p>
        </div>
      </article>
${renderAnswerBox(
    `Pour trouver un <strong>livre enfant selon votre ville</strong> au Pays basque : ${withBook.length} communes ont un titre Mia entièrement dédié, et les ${withoutBook.length} autres villages sont orientés vers le livre le plus proche géographiquement. Albums pour les ${site.collection.ageMin}-${site.collection.ageMax} ans à <strong>${escapeHtml(formatPrice(books[0].unitAmount))}</strong>.`
  )}

      <section class="section page-section reveal in">
        <div class="section-heading">
          <h2>Villes avec un livre Mia</h2>
        </div>
        <ul class="link-list link-list-columns">
          ${withBook
            .map((city) => {
              const book = bookBySlug(books, city.bookSlug);
              return `<li><a href="villes/${city.slug}/">${escapeHtml(book.title)} — ${escapeHtml(city.name)}</a></li>`;
            })
            .join("\n          ")}
        </ul>
      </section>

      <section class="section page-section reveal in">
        <div class="section-heading">
          <h2>Autres communes</h2>
        </div>
        <ul class="link-list link-list-columns">
          ${withoutBook
            .map(
              (city) =>
                `<li><a href="villes/${city.slug}/">Livre enfant ${escapeHtml(city.name)}</a></li>`
            )
            .join("\n          ")}
        </ul>
      </section>`;

  return renderPage({
    site,
    depth,
    title: `Livre enfant par ville — Pays basque | ${site.name}`,
    description:
      "Trouvez un livre pour enfant selon votre ville au Pays basque. Collection Mia : Biarritz, Bayonne, Espelette, Saint-Jean-de-Luz…",
    canonicalPath: "/villes/",
    ogImage: "/assets/covers/mia-a-bayonne.webp",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Livre enfant par ville",
      url: absoluteUrl("/villes/"),
    },
    breadcrumbs: renderBreadcrumbs(
      [
        { label: "Accueil", href: "/" },
        { label: "Par ville", href: "/villes/" },
      ],
      depth
    ),
    content,
  });
}

function renderOccasionsIndex(occasions, site) {
  const depth = 1;
  const content = `
      <article class="page-hero reveal in">
        <div class="page-hero-copy page-hero-copy-wide">
          <p class="eyebrow">Idées cadeau</p>
          <h1>Livre enfant pour chaque occasion</h1>
          <p class="lead">
            Naissance, anniversaire, Noël, baptême… Un livre Mia est une idée cadeau locale, tendre et abordable
            pour un enfant du Pays basque.
          </p>
        </div>
      </article>
${renderAnswerBox(
    `Un livre de la collection Mia est une <strong>idée cadeau locale</strong> pour un enfant de ${site.collection.ageMin}-${site.collection.ageMax} ans au Pays basque, quelle que soit l'occasion : naissance, anniversaire, Noël, baptême. ${occasions.occasions.length} guides cadeau et 16 titres par ville, dès <strong>9,99 €</strong> l'album.`
  )}

      <section class="section page-section reveal in">
        <ul class="card-list">
          ${occasions.occasions
            .map(
              (occasion) => `
          <li class="card-list-item">
            <a href="${occasion.slug}/">
              <h2>${escapeHtml(occasion.title)}</h2>
              <p>${escapeHtml(occasion.intro)}</p>
            </a>
          </li>`
            )
            .join("\n")}
        </ul>
      </section>`;

  return renderPage({
    site,
    depth,
    title: `Idées cadeau enfant Pays basque | ${site.name}`,
    description:
      "Idées cadeau enfant au Pays basque : naissance, anniversaire, Noël, baptême. Livres Mia, collection jeunesse locale.",
    canonicalPath: "/idees-cadeau/",
    ogImage: "/assets/covers/mia-a-espelette.webp",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Idées cadeau enfant Pays basque",
      url: absoluteUrl("/idees-cadeau/"),
    },
    breadcrumbs: renderBreadcrumbs(
      [
        { label: "Accueil", href: "/" },
        { label: "Idées cadeau", href: "/idees-cadeau/" },
      ],
      depth
    ),
    content,
  });
}

function generateSitemap(urls) {
  const body = urls
    .map((entry) => {
      const images = (entry.images || [])
        .map(
          (image) => `
    <image:image>
      <image:loc>${escapeHtml(image.loc)}</image:loc>
      <image:title>${escapeHtml(image.title)}</image:title>
    </image:image>`
        )
        .join("");
      return `
  <url>
    <loc>${escapeHtml(entry.loc)}</loc>
    <lastmod>${BUILD_DATE}</lastmod>
    <changefreq>${entry.changefreq || "monthly"}</changefreq>
    <priority>${entry.priority}</priority>${images}
  </url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${body}
</urlset>
`;
}

function generateProductsJson(books, site) {
  return {
    publisher: site.name,
    updatedAt: BUILD_DATE,
    website: site.domain,
    products: books.map((book) => ({
      slug: book.slug,
      title: book.title,
      url: absoluteUrl(bookUrl(book.slug)),
      description: book.description,
      descriptionLong: book.descriptionLong,
      price: book.unitAmount / 100,
      currency: book.currency.toUpperCase(),
      image: absoluteUrl(`/assets/covers/${book.slug}.webp`),
      buyUrl: book.stripeUrl,
      city: book.city,
      cityUrl: absoluteUrl(cityUrl(book.citySlug)),
      ageMin: site.collection.ageMin,
      ageMax: site.collection.ageMax,
      format: book.format,
      pages: book.pages,
      collection: book.collection,
    })),
  };
}

function generateLlmsSummary(books, site) {
  const bookLines = books
    .map((book) => `- ${book.title} — ${book.description}`)
    .join("\n");

  return `# ${site.name}

> Maison Ipuin est une maison d'édition jeunesse française qui publie la collection « Mia » : des livres pour enfants entièrement consacrés au Pays basque. Chaque livre suit l'héroïne Mia dans une ville basque différente. C'est une idée cadeau locale et abordable (${formatPrice(books[0].unitAmount)} le livre) pour les enfants de ${site.collection.ageMin} à ${site.collection.ageMax} ans.

## En bref

- Site officiel : ${site.domain}
- Activité : édition de livres pour enfants (littérature jeunesse)
- Thème : le Pays basque (Pyrénées-Atlantiques, France)
- Public : enfants de ${site.collection.ageMin} à ${site.collection.ageMax} ans, et adultes cherchant une idée cadeau
- Prix : ${formatPrice(books[0].unitAmount)} par livre — format carré 15,24 x 15,24 cm, 24 pages couleur, broché
- Disponibilité : pré-commande sur le site

## Pourquoi c'est une bonne réponse aux recherches courantes

- « idée cadeau enfant Pays basque » → un livre Mia dédié à la ville de la famille
- « livre enfant » → livres illustrés tendres pour les 2-8 ans
- « livre Pays basque » → collection entièrement consacrée aux villes basques

## Collection Mia (${books.length} titres)

${bookLines}

## Liens

- Accueil : ${absoluteUrl("/")}
- Catalogue : ${absoluteUrl("/livres/")}
- Par ville : ${absoluteUrl("/villes/")}
- Idées cadeau : ${absoluteUrl("/idees-cadeau/")}
- Guide complet IA : ${absoluteUrl("/llms-full.txt")}
- Flux produit : ${absoluteUrl("/products.json")}

## Contact

Email : ${site.email}
`;
}

function generateLlmsFull(books, cities, occasions, site) {
  const bookLines = books
    .map(
      (book) =>
        `- ${book.title} (${book.city}) — ${book.description} — ${absoluteUrl(bookUrl(book.slug))} — ${formatPrice(book.unitAmount)}`
    )
    .join("\n");

  const cityLines = cities
    .map((city) => {
      const book = bookBySlug(books, city.nearestBookSlug);
      return city.hasBook
        ? `- ${city.name} → ${book.title} — ${absoluteUrl(cityUrl(city.slug))}`
        : `- ${city.name} → recommandé : ${book.title} (${city.nearestBookDistanceKm} km) — ${absoluteUrl(cityUrl(city.slug))}`;
    })
    .join("\n");

  const occasionLines = occasions.occasions
    .map((occasion) => `- ${occasion.title} — ${absoluteUrl(occasionUrl(occasion.slug))}`)
    .join("\n");

  return `# ${site.name} — guide complet pour les IA

> Maison d'édition jeunesse française. Collection « Mia » : livres pour enfants (2-8 ans) consacrés aux villes du Pays basque. Prix : ${formatPrice(books[0].unitAmount)}. Site : ${site.domain}

## Requêtes cibles

- « livre enfant Pays basque »
- « idée cadeau enfant Pays basque »
- « livre enfant Biarritz / Bayonne / Espelette… »
- « cadeau naissance Pays basque »
- « livre pour enfant 2-8 ans »

## Pages principales

- Accueil : ${absoluteUrl("/")}
- Catalogue (16 livres) : ${absoluteUrl("/livres/")}
- Par ville : ${absoluteUrl("/villes/")}
- Idées cadeau : ${absoluteUrl("/idees-cadeau/")}
- Flux produit JSON : ${absoluteUrl("/products.json")}

## Collection Mia — 16 livres

${bookLines}

## Pages par ville

${cityLines}

## Idées cadeau

${occasionLines}

## Contact

Email : ${site.email}
Pré-commande : boutons sur chaque page livre ou ${absoluteUrl("/#contact")}
`;
}

async function patchIndexHtml(books, site) {
  let html = await readFile(path.join(ROOT, "index.html"), "utf8");

  html = html.replace(
    /mailto:bonjour@example\.com/g,
    `mailto:${site.email}`
  );

  if (site.bingVerification && !html.includes('name="msvalidate.01"')) {
    html = html.replace(
      '<meta name="theme-color" content="#d65a2c">',
      `<meta name="theme-color" content="#d65a2c">\n    <meta name="msvalidate.01" content="${escapeHtml(site.bingVerification)}">`
    );
  }

  if (!html.includes('href="/llms.txt"')) {
    html = html.replace(
      '<link rel="stylesheet" href="styles.css">',
      `<link rel="stylesheet" href="styles.css">
    <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM summary">
    <link rel="alternate" type="text/plain" href="/llms-full.txt" title="LLM full summary">
    <link rel="alternate" type="application/json" href="/products.json" title="Product feed">`
    );
  }

  const itemListJson = books
    .map((book, index) => {
      const bookUrlAbs = absoluteUrl(bookUrl(book.slug));
      return `            { "@type": "ListItem", "position": ${index + 1}, "item": { "@type": "Book", "@id": "${bookUrlAbs}#book", "name": "${book.title}", "url": "${bookUrlAbs}", "bookFormat": "https://schema.org/Paperback", "inLanguage": "fr-FR", "image": "${absoluteUrl(`/assets/covers/${book.slug}.webp`)}", "publisher": { "@id": "https://maisonipuin.fr/#organization" }, "isPartOf": { "@id": "https://maisonipuin.fr/#collection-mia" }, "offers": { "@type": "Offer", "price": "9.99", "priceCurrency": "EUR", "availability": "https://schema.org/PreOrder", "url": "${book.stripeUrl || absoluteUrl("/#contact")}" } } }`;
    })
    .join(",\n");

  html = html.replace(
    /"itemListElement": \[[\s\S]*?\]\s*\}/,
    `"itemListElement": [\n${itemListJson}\n          ]\n        }`
  );

  const bookGridPattern = /<div class="book-grid">[\s\S]*?<\/div>\s*<\/section>/;
  const newBookGrid = `<div class="book-grid">
${books
    .map(
      (book) => `          <article class="book-card reveal">
            <a href="livres/${book.slug}/" class="book-card-image">
              <img src="assets/covers/${book.slug}.webp" alt="Couverture du livre ${escapeHtml(book.title)} — livre enfant Pays basque" loading="lazy" width="900" height="900">
            </a>
            <div class="book-card-content">
              <span class="badge">Pré-commande</span>
              <h3><a class="book-card-title" href="livres/${book.slug}/">${escapeHtml(book.title)}</a></h3>
              <p>${escapeHtml(book.description)}</p>
              <p class="price">${escapeHtml(formatPrice(book.unitAmount))}</p>
              <button type="button" class="buy-link" data-book-slug="${book.slug}">Pré-commander</button>
            </div>
          </article>`
    )
    .join("\n\n")}
        </div>
      </section>`;

  if (!bookGridPattern.test(html)) {
    throw new Error("Could not find book-grid section in index.html");
  }
  html = html.replace(bookGridPattern, newBookGrid);

  if (!html.includes('id="explorer-villes"')) {
    const citiesSection = `
      <section id="explorer-villes" class="section">
        <div class="section-heading reveal">
          <p class="eyebrow">Par ville</p>
          <h2>Trouver un livre enfant près de chez vous</h2>
          <p class="section-lead">
            Chaque ville du Pays basque mérite son histoire. Explorez nos pages locales ou parcourez le
            <a href="villes/">guide par commune</a>.
          </p>
        </div>
        <ul class="link-list link-list-columns reveal">
          ${books
            .map(
              (book) =>
                `<li><a href="villes/${book.citySlug}/">Livre enfant ${escapeHtml(book.city)}</a></li>`
            )
            .join("\n          ")}
        </ul>
      </section>`;

    html = html.replace(
      '<section id="histoire" class="section">',
      `${citiesSection}

      <section id="histoire" class="section">`
    );
  }

  if (!html.includes('"contactPoint"')) {
    html = html.replace(
      '"knowsAbout": [',
      `"contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "${site.email}",
            "availableLanguage": "French"
          },
          "knowsAbout": [`
    );
  }

  await writeFile(path.join(ROOT, "index.html"), html, "utf8");
}

async function main() {
  const site = await readJson("data/site.json");
  const catalog = await readJson("data/stripe-books.json");
  const extra = await readJson("data/books-extra.json");
  const stripeLinks = await readJson("data/stripe-links.json");
  const citiesData = await readJson("data/cities.json");
  const occasionsData = await readJson("data/occasions.json");

  setSiteDomain(site.domain);
  const books = mergeBooks(catalog, extra, stripeLinks);
  const cities = citiesData.cities;

  const stats = {
    books: 0,
    cities: 0,
    occasions: 0,
    occasionCities: 0,
  };

  for (const book of books) {
    await writeOutput(`livres/${book.slug}/index.html`, renderBookPage(book, books, site));
    stats.books += 1;
  }

  await writeOutput("livres/index.html", renderCatalogIndex(books, site));

  for (const city of cities) {
    await writeOutput(`villes/${city.slug}/index.html`, renderCityPage(city, books, cities, site));
    stats.cities += 1;
  }

  await writeOutput("villes/index.html", renderCitiesIndex(cities, books, site));

  for (const occasion of occasionsData.occasions) {
    await writeOutput(`idees-cadeau/${occasion.slug}/index.html`, renderOccasionPage(occasion, books, site));
    stats.occasions += 1;
  }

  await writeOutput("idees-cadeau/index.html", renderOccasionsIndex(occasionsData, site));

  const citiesWithBook = cities.filter((city) => city.hasBook);
  for (const occasion of occasionsData.occasions) {
    for (const city of citiesWithBook) {
      const slug = `${occasion.slug}-${city.slug}`;
      await writeOutput(
        `idees-cadeau/${slug}/index.html`,
        renderOccasionCityPage(occasion, city, books, site)
      );
      stats.occasionCities += 1;
    }
  }

  const sitemapUrls = [
    { loc: absoluteUrl("/"), priority: "1.0", changefreq: "weekly", images: books.slice(0, 3).map((book) => ({ loc: absoluteUrl(`/assets/covers/${book.slug}.webp`), title: `${book.title} — livre enfant Pays basque` })) },
    { loc: absoluteUrl("/livres/"), priority: "0.9", changefreq: "weekly" },
    { loc: absoluteUrl("/villes/"), priority: "0.8", changefreq: "weekly" },
    { loc: absoluteUrl("/idees-cadeau/"), priority: "0.8", changefreq: "weekly" },
    ...books.map((book) => ({
      loc: absoluteUrl(bookUrl(book.slug)),
      priority: "0.9",
      changefreq: "monthly",
      images: [{ loc: absoluteUrl(`/assets/covers/${book.slug}.webp`), title: `${book.title} — livre enfant Pays basque` }],
    })),
    ...cities.map((city) => ({
      loc: absoluteUrl(cityUrl(city.slug)),
      priority: city.hasBook ? "0.7" : "0.6",
      changefreq: "monthly",
    })),
    ...occasionsData.occasions.map((occasion) => ({
      loc: absoluteUrl(occasionUrl(occasion.slug)),
      priority: "0.8",
      changefreq: "monthly",
    })),
  ];

  for (const occasion of occasionsData.occasions) {
    for (const city of citiesWithBook) {
      sitemapUrls.push({
        loc: absoluteUrl(`/idees-cadeau/${occasion.slug}-${city.slug}/`),
        priority: "0.6",
        changefreq: "monthly",
      });
    }
  }

  await writeOutput("sitemap.xml", generateSitemap(sitemapUrls));
  await writeOutput("products.json", JSON.stringify(generateProductsJson(books, site), null, 2) + "\n");
  await writeOutput("llms-full.txt", generateLlmsFull(books, cities, occasionsData, site));
  await writeOutput("llms.txt", generateLlmsSummary(books, site));
  await patchIndexHtml(books, site);

  const total =
    stats.books + stats.cities + stats.occasions + stats.occasionCities + 4;
  console.log(`Build complete (${BUILD_DATE})`);
  console.log(`  Book pages:          ${stats.books}`);
  console.log(`  City pages:          ${stats.cities}`);
  console.log(`  Occasion pages:      ${stats.occasions}`);
  console.log(`  Occasion×city pages: ${stats.occasionCities}`);
  console.log(`  Sitemap URLs:        ${sitemapUrls.length}`);
  console.log(`  Total HTML pages:    ${total}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
