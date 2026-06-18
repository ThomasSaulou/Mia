const SITE = {
  domain: "https://maisonipuin.fr",
};

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function formatPrice(unitAmount) {
  return `${(unitAmount / 100).toFixed(2).replace(".", ",")} €`;
}

export function assetPrefix(depth) {
  return depth > 0 ? "../".repeat(depth) : "";
}

export function absoluteUrl(path) {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.domain}${normalized}`;
}

export function coverUrl(slug, depth = 0) {
  return `${assetPrefix(depth)}assets/covers/${slug}.webp`;
}

export function bookUrl(slug) {
  return `/livres/${slug}/`;
}

export function cityUrl(slug) {
  return `/villes/${slug}/`;
}

export function occasionUrl(slug) {
  return `/idees-cadeau/${slug}/`;
}

export function setSiteDomain(domain) {
  SITE.domain = domain.replace(/\/$/, "");
}

export function renderBreadcrumbs(items, depth) {
  const prefix = assetPrefix(depth);
  const parts = items
    .map((item, index) => {
      const isLast = index === items.length - 1;
      if (isLast) {
        return `<li aria-current="page">${escapeHtml(item.label)}</li>`;
      }
      const href = item.href.startsWith("http") ? item.href : `${prefix}${item.href.replace(/^\//, "")}`;
      return `<li><a href="${escapeHtml(href)}">${escapeHtml(item.label)}</a></li>`;
    })
    .join("\n          ");

  return `
      <nav class="breadcrumbs" aria-label="Fil d'Ariane">
        <ol>
          ${parts}
        </ol>
      </nav>`;
}

export function renderBookCard(book, stripeUrl, depth, options = {}) {
  const prefix = assetPrefix(depth);
  const heading = options.heading || "h3";
  const linkTitle = options.linkTitle !== false;

  const titleMarkup = linkTitle
    ? `<a class="book-card-title" href="${prefix}livres/${book.slug}/">${escapeHtml(book.title)}</a>`
    : `<${heading}>${escapeHtml(book.title)}</${heading}>`;

  const buyMarkup = stripeUrl
    ? `<a class="buy-link button" href="${escapeHtml(stripeUrl)}">Pré-commander — ${escapeHtml(formatPrice(book.unitAmount))}</a>`
    : `<a class="buy-link button" href="${prefix}#contact">Pré-commander — ${escapeHtml(formatPrice(book.unitAmount))}</a>`;

  return `
        <article class="book-card reveal">
          <a href="${prefix}livres/${book.slug}/" class="book-card-image">
            <img src="${prefix}assets/covers/${book.slug}.webp" alt="Couverture du livre ${escapeHtml(book.title)} — livre enfant Pays basque" loading="lazy" width="900" height="900">
          </a>
          <div class="book-card-content">
            <span class="badge">Pré-commande</span>
            ${linkTitle ? `<h3>${titleMarkup}</h3>` : titleMarkup}
            <p>${escapeHtml(book.description)}</p>
            <p class="price">${escapeHtml(formatPrice(book.unitAmount))}</p>
            ${buyMarkup}
          </div>
        </article>`;
}

export function renderAnswerBox(innerHtml) {
  return `
      <section class="answer-box reveal in" aria-label="Réponse en bref">
        <p class="answer-label">En bref</p>
        <p>${innerHtml}</p>
      </section>`;
}

export function renderPullQuote(text, cite) {
  return `
      <figure class="pull-quote reveal in">
        <blockquote>${escapeHtml(text)}</blockquote>
        <figcaption>— ${escapeHtml(cite)}</figcaption>
      </figure>`;
}

export function renderFaq(faqItems) {
  return faqItems
    .map(
      (item) => `
          <details class="faq-item">
            <summary>${escapeHtml(item.q)}</summary>
            <p>${escapeHtml(item.a)}</p>
          </details>`
    )
    .join("\n");
}

export function renderPage({
  site,
  depth,
  title,
  description,
  canonicalPath,
  ogImage,
  jsonLd,
  breadcrumbs,
  content,
  extraHead = "",
}) {
  const prefix = assetPrefix(depth);
  const canonical = absoluteUrl(canonicalPath);
  const image = ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage.replace(/^\//, ""));

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="author" content="${escapeHtml(site.name)}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="theme-color" content="#d65a2c">
    ${site.bingVerification ? `<meta name="msvalidate.01" content="${escapeHtml(site.bingVerification)}">\n    ` : ""}<link rel="canonical" href="${escapeHtml(canonical)}">
    <meta name="geo.region" content="${escapeHtml(site.geo.region)}">
    <meta name="geo.placename" content="${escapeHtml(site.geo.placename)}">
    <meta name="geo.position" content="${escapeHtml(site.geo.position)}">
    <meta name="ICBM" content="${escapeHtml(site.geo.icbm)}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${escapeHtml(site.name)}">
    <meta property="og:locale" content="${site.locale.replace("_", "-")}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:image" content="${escapeHtml(image)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(image)}">
    <link rel="icon" type="image/svg+xml" href="${prefix}assets/logo-maison-ipuin.svg">
    <link rel="alternate" type="text/plain" href="${prefix}llms.txt" title="LLM summary">
    <link rel="alternate" type="text/plain" href="${prefix}llms-full.txt" title="LLM full summary">
    <link rel="alternate" type="application/json" href="${prefix}products.json" title="Product feed">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,400..500&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${prefix}styles.css">
    ${extraHead}
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="${prefix}index.html" aria-label="Accueil ${escapeHtml(site.name)}">
        <img class="brand-mark" src="${prefix}assets/logo-maison-ipuin.svg" alt="" width="46" height="46">
        <span>
          <strong>${escapeHtml(site.name)}</strong>
          <small>${escapeHtml(site.tagline)}</small>
        </span>
      </a>
      <nav class="nav" aria-label="Navigation principale">
        <a href="${prefix}livres/">Catalogue</a>
        <a href="${prefix}villes/">Par ville</a>
        <a href="${prefix}idees-cadeau/">Idées cadeau</a>
        <a href="${prefix}index.html#faq">FAQ</a>
        <a href="${prefix}index.html#contact">Contact</a>
      </nav>
    </header>

    <main class="content-page">
      ${breadcrumbs}
      ${content}
    </main>

    <footer class="footer">
      <div class="footer-brand">
        <img class="footer-logo" src="${prefix}assets/logo-maison-ipuin.svg" alt="" width="54" height="54">
        <div>
          <strong>${escapeHtml(site.name)}</strong>
          <p>Livres pour enfants sur le Pays basque — collection Mia.</p>
        </div>
      </div>
      <div class="footer-links">
        <a href="${prefix}livres/">Catalogue</a>
        <a href="${prefix}villes/">Par ville</a>
        <a href="${prefix}idees-cadeau/">Idées cadeau</a>
        <a href="mailto:${escapeHtml(site.email)}?subject=Pr%C3%A9-commande%20d%27un%20livre%20Mia">Nous écrire</a>
      </div>
    </footer>
  </body>
</html>
`;
}
