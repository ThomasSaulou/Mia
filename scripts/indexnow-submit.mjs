#!/usr/bin/env node

// Soumet toutes les URLs du sitemap au protocole IndexNow.
// IndexNow notifie instantanément Bing (et donc ChatGPT Search, qui s'appuie
// à ~87 % sur l'index de Bing), Yandex, Naver… via un seul appel.
//
// Pré-requis : le fichier <indexNowKey>.txt doit être hébergé à la racine du
// domaine (il l'est : committé dans le dépôt et servi par GitHub Pages).
//
// Usage : node scripts/indexnow-submit.mjs
// La commande n'échoue jamais le build : en cas d'erreur réseau elle journalise
// et sort en code 0 (l'indexation reste déclenchée au prochain passage).

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

async function main() {
  const site = JSON.parse(await readFile(path.join(ROOT, "data/site.json"), "utf8"));
  const key = site.indexNowKey;
  if (!key) {
    console.log("Pas de indexNowKey dans data/site.json — soumission ignorée.");
    return;
  }

  const domain = site.domain.replace(/\/$/, "");
  const host = domain.replace(/^https?:\/\//, "");

  const sitemap = await readFile(path.join(ROOT, "sitemap.xml"), "utf8");
  const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim())
    .filter((u) => u.startsWith("http"));

  if (urlList.length === 0) {
    console.log("Aucune URL trouvée dans sitemap.xml — soumission ignorée.");
    return;
  }

  const payload = {
    host,
    key,
    keyLocation: `${domain}/${key}.txt`,
    urlList,
  };

  console.log(`IndexNow : soumission de ${urlList.length} URLs pour ${host}…`);

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    console.log(`IndexNow a répondu : ${res.status} ${res.statusText}`);
    if (res.status >= 400) {
      const body = await res.text().catch(() => "");
      console.log(`Détail : ${body.slice(0, 500)}`);
    }
  } catch (error) {
    console.log(`IndexNow injoignable (sans gravité) : ${error.message}`);
  }
}

main();
