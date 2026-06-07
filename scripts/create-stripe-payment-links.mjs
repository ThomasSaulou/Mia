#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const booksPath = path.join(rootDir, "data", "stripe-books.json");
const linksPath = path.join(rootDir, "data", "stripe-links.json");

const apiKey = process.env.STRIPE_API_KEY;

if (!apiKey) {
  console.error("Missing STRIPE_API_KEY environment variable.");
  console.error("Example: STRIPE_API_KEY=rk_live_... node scripts/create-stripe-payment-links.mjs");
  process.exit(1);
}

const config = JSON.parse(await readFile(booksPath, "utf8"));

function appendFormValue(params, key, value) {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    value.forEach((item) => params.append(`${key}[]`, String(item)));
    return;
  }
  params.append(key, String(value));
}

async function stripeRequest(method, endpoint, body = {}) {
  const params = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => appendFormValue(params, key, value));

  const url = new URL(`https://api.stripe.com/v1${endpoint}`);
  const request = {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };

  if (method === "GET") {
    params.forEach((value, key) => url.searchParams.append(key, value));
  } else {
    request.body = params;
  }

  const response = await fetch(url, request);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.error?.message || response.statusText;
    throw new Error(`Stripe ${method} ${endpoint} failed: ${message}`);
  }

  return payload;
}

async function listAll(endpoint, params = {}) {
  const results = [];
  let startingAfter = null;

  do {
    const page = await stripeRequest("GET", endpoint, {
      ...params,
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {})
    });

    results.push(...(page.data || []));
    startingAfter = page.has_more && page.data?.length
      ? page.data[page.data.length - 1].id
      : null;
  } while (startingAfter);

  return results;
}

function formatPrice(unitAmount, currency) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(unitAmount / 100);
}

async function findProductBySlug(slug) {
  const products = await listAll("/products", { active: true });
  return products.find((product) => product.metadata?.slug === slug) || null;
}

async function findPrice(productId, unitAmount, currency) {
  const prices = await listAll("/prices", { active: true, product: productId });
  return prices.find((price) => (
    price.unit_amount === unitAmount &&
    price.currency === currency &&
    !price.recurring
  )) || null;
}

async function findPaymentLinkBySlug(slug) {
  const links = await listAll("/payment_links", { active: true });
  return links.find((link) => link.metadata?.slug === slug) || null;
}

async function paymentLinkUsesPrice(paymentLinkId, priceId) {
  const lineItems = await listAll(`/payment_links/${paymentLinkId}/line_items`);
  return lineItems.some((item) => item.price?.id === priceId);
}

function productPayload(book) {
  return {
    name: book.title,
    description: book.description,
    "metadata[slug]": book.slug,
    "metadata[collection]": config.collection,
    "metadata[format]": config.format,
    "metadata[pages]": config.pages,
    "metadata[interior]": config.interior
  };
}

async function ensureProduct(book) {
  const existing = await findProductBySlug(book.slug);
  if (existing) {
    return stripeRequest("POST", `/products/${existing.id}`, productPayload(book));
  }

  return stripeRequest("POST", "/products", productPayload(book));
}

async function ensurePrice(book, productId) {
  const existing = await findPrice(productId, config.unitAmount, config.currency);
  if (existing) return existing;

  return stripeRequest("POST", "/prices", {
    product: productId,
    currency: config.currency,
    unit_amount: config.unitAmount,
    nickname: `${book.title} - ${formatPrice(config.unitAmount, config.currency)}`,
    "metadata[slug]": book.slug,
    "metadata[collection]": config.collection
  });
}

async function ensurePaymentLink(book, priceId) {
  const existing = await findPaymentLinkBySlug(book.slug);
  if (existing) {
    if (await paymentLinkUsesPrice(existing.id, priceId)) return existing;

    await stripeRequest("POST", `/payment_links/${existing.id}`, {
      active: false
    });
  }

  return stripeRequest("POST", "/payment_links", {
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": 1,
    "line_items[0][adjustable_quantity][enabled]": config.adjustableQuantity?.enabled ?? true,
    "line_items[0][adjustable_quantity][minimum]": config.adjustableQuantity?.minimum ?? 1,
    "line_items[0][adjustable_quantity][maximum]": config.adjustableQuantity?.maximum ?? 10,
    "metadata[slug]": book.slug,
    "metadata[title]": book.title,
    "phone_number_collection[enabled]": true,
    "shipping_address_collection[allowed_countries]": config.shippingAddressCountries || ["FR"]
  });
}

const links = [];

for (const book of config.books) {
  console.log(`Creating or reusing Stripe link for ${book.title}...`);
  const product = await ensureProduct(book);
  const price = await ensurePrice(book, product.id);
  const paymentLink = await ensurePaymentLink(book, price.id);

  links.push({
    slug: book.slug,
    title: book.title,
    url: paymentLink.url,
    productId: product.id,
    priceId: price.id,
    paymentLinkId: paymentLink.id
  });
}

const output = {
  generatedAt: new Date().toISOString(),
  price: {
    currency: config.currency,
    unitAmount: config.unitAmount,
    display: formatPrice(config.unitAmount, config.currency)
  },
  links
};

await writeFile(linksPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Wrote ${links.length} Stripe links to ${path.relative(rootDir, linksPath)}.`);
