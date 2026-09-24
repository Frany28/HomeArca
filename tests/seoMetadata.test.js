import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (relativePath) =>
  readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");

const indexSource = read("index.html");

test("the public site exposes complete indexable metadata", () => {
  assert.match(indexSource, /<html lang="es">/);
  assert.match(
    indexSource,
    /<title>ARCAstudio \| Arquitectura, Construcción e Interiorismo<\/title>/,
  );
  assert.match(indexSource, /name="description"/);
  assert.match(
    indexSource,
    /rel="canonical" href="https:\/\/arcastudio2025\.com\/"/,
  );
  assert.match(indexSource, /property="og:image"/);
  assert.match(
    indexSource,
    /name="twitter:card" content="summary_large_image"/,
  );
  assert.match(indexSource, /type="application\/ld\+json"/);
  assert.match(indexSource, /"@type": "WebSite"/);
  assert.match(indexSource, /"@type": "Organization"/);

  const structuredData = indexSource.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );

  assert.ok(structuredData);
  assert.doesNotThrow(() => JSON.parse(structuredData[1]));
});

test("robots, sitemap, favicon and social image are deployable public assets", () => {
  for (const asset of [
    "public/robots.txt",
    "public/sitemap.xml",
    "public/arca-studio-logo.svg",
    "public/arca-studio-og.webp",
  ]) {
    assert.equal(existsSync(new URL(`../${asset}`, import.meta.url)), true);
  }

  assert.match(
    read("public/robots.txt"),
    /Sitemap: https:\/\/arcastudio2025\.com\/sitemap\.xml/,
  );
  assert.match(
    read("public/sitemap.xml"),
    /<loc>https:\/\/arcastudio2025\.com\/<\/loc>/,
  );
});

test("the www hostname redirects permanently to the canonical domain", () => {
  const netlifySource = read("netlify.toml");

  assert.match(
    netlifySource,
    /from = "https:\/\/www\.arcastudio2025\.com\/\*"/,
  );
  assert.match(
    netlifySource,
    /to = "https:\/\/arcastudio2025\.com\/:splat"/,
  );
  assert.match(netlifySource, /status = 301/);
});

test("only the first visual Home panel uses the primary heading", () => {
  const sectionsSource = read(
    "src/pages/publicSite/home/components/HomeSections.jsx",
  );
  const heroTitleSource = read(
    "src/pages/publicSite/home/components/HomeHeroTitle/HomeHeroTitle.jsx",
  );

  assert.match(
    sectionsSource,
    /headingLevel=\{panelIndex === 0 \? 1 : 2\}/,
  );
  assert.match(
    heroTitleSource,
    /headingLevel === 1 \? "h1" : "h2"/,
  );
});
