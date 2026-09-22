import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const mainSource = readFileSync(
  new URL("../src/main.jsx", import.meta.url),
  "utf8",
);
const indexCss = readFileSync(
  new URL("../src/index.css", import.meta.url),
  "utf8",
);
const globalCss = readFileSync(
  new URL("../src/styles/global.css", import.meta.url),
  "utf8",
);
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const indexHtml = readFileSync(
  new URL("../index.html", import.meta.url),
  "utf8",
);

test("Inter Variable is bundled and enforced globally across devices", () => {
  assert.equal(
    packageJson.dependencies["@fontsource-variable/inter"],
    "5.3.0",
  );
  assert.match(mainSource, /import "@fontsource-variable\/inter";/);
  assert.match(
    globalCss,
    /--app-font-sans: "Inter Variable", sans-serif;/,
  );
  assert.match(indexCss, /html \{[\s\S]*font-family: var\(--app-font-sans\);/);
  assert.match(indexCss, /body \{[\s\S]*font-family: inherit;/);
  assert.match(
    indexCss,
    /button,[\s\S]*input,[\s\S]*select,[\s\S]*textarea[\s\S]*font-family: inherit;/,
  );
  assert.doesNotMatch(indexCss, /font-family: system-ui, sans-serif;/);
  assert.match(indexHtml, /<html lang="es">/);
  assert.doesNotMatch(indexHtml, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
});
