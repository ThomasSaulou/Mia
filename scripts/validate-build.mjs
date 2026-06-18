#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MIN_WORDS = 180;

function visibleText(html) {
  const main = html.match(/<main[\s\S]*?<\/main>/i);
  const chunk = main ? main[0] : html;
  return chunk
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(text) {
  return text ? text.split(" ").filter(Boolean).length : 0;
}

async function walkHtmlFiles(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkHtmlFiles(fullPath, files);
    } else if (entry.name === "index.html") {
      files.push(fullPath);
    }
  }
  return files;
}

async function validateFile(filePath) {
  const html = await readFile(filePath, "utf8");
  const issues = [];
  const text = visibleText(html);
  const words = wordCount(text);

  if (words < MIN_WORDS) {
    issues.push(`only ${words} visible words in <main> (min ${MIN_WORDS})`);
  }
  if (!html.includes('rel="canonical"')) {
    issues.push("missing canonical");
  }
  if (!html.includes("application/ld+json")) {
    issues.push("missing JSON-LD");
  }
  if (!/<title>[^<]+<\/title>/.test(html)) {
    issues.push("missing title");
  }

  return { filePath, issues, words };
}

async function main() {
  const dirs = ["livres", "villes", "idees-cadeau"].map((dir) => path.join(ROOT, dir));
  const files = [];
  for (const dir of dirs) {
    files.push(...(await walkHtmlFiles(dir)));
  }

  const failures = [];
  for (const file of files) {
    const result = await validateFile(file);
    if (result.issues.length) {
      failures.push(result);
    }
  }

  if (failures.length) {
    console.error(`Validation failed for ${failures.length} page(s):`);
    for (const failure of failures) {
      console.error(`  ${path.relative(ROOT, failure.filePath)} (${failure.words} words)`);
      for (const issue of failure.issues) {
        console.error(`    - ${issue}`);
      }
    }
    process.exit(1);
  }

  console.log(`Validated ${files.length} generated pages (min ${MIN_WORDS} words each).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
