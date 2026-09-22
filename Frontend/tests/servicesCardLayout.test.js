import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const showcaseSource = readFileSync(
  new URL(
    "../src/pages/publicSite/services/components/ServicesCategoryShowcase.jsx",
    import.meta.url,
  ),
  "utf8",
);

const showcaseCss = readFileSync(
  new URL(
    "../src/pages/publicSite/services/components/ServicesCategoryShowcase.css",
    import.meta.url,
  ),
  "utf8",
);

const servicesContentSource = readFileSync(
  new URL(
    "../src/pages/publicSite/services/servicesContent.js",
    import.meta.url,
  ),
  "utf8",
);

const sectionCss = readFileSync(
  new URL(
    "../src/pages/publicSite/services/components/ServicesSection.css",
    import.meta.url,
  ),
  "utf8",
);

test("services card viewport uses explicit inset geometry instead of percentage height", () => {
  assert.match(
    showcaseSource,
    /services-category-showcase__viewport absolute overflow-hidden/,
  );
  assert.doesNotMatch(
    showcaseSource,
    /services-category-showcase__viewport[^"]*size-full/,
  );
  assert.match(
    showcaseCss,
    /\.services-category-showcase__viewport\s*\{[\s\S]*inset:\s*var\(--services-frame-inset\)/,
  );
});

test("services card keeps the same visual inset across responsive breakpoints", () => {
  assert.match(
    showcaseCss,
    /--services-frame-inset:\s*24px/,
  );
  assert.match(
    showcaseCss,
    /@media \(width < 1024px\)[\s\S]*--services-frame-inset:\s*16px/,
  );
  assert.match(
    sectionCss,
    /@media \(width < 768px\)[\s\S]*--services-frame-inset:\s*18px/,
  );
});

test("services card enables a WebKit-safe rounded clipping layer", () => {
  assert.match(
    showcaseCss,
    /-webkit-mask-image:\s*-webkit-radial-gradient\(white, black\)/,
  );
});

test("service images keep their proportions and use a focal point per category", () => {
  assert.match(
    showcaseSource,
    /className="absolute inset-0 size-full object-cover"/,
  );
  assert.match(
    showcaseSource,
    /style=\{\{ objectPosition: category\.imagePosition \}\}/,
  );
  assert.doesNotMatch(showcaseSource, /h-\[162\.23%\]|w-\[438\.02%\]/);
  assert.equal(
    servicesContentSource.match(/imagePosition:\s*"\d+% \d+%"/g)?.length,
    7,
  );
});
