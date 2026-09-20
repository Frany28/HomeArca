import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const panelSource = readFileSync(
  new URL(
    "../src/pages/publicSite/featuredProjects/components/FeaturedProjectsProjectPanel.jsx",
    import.meta.url,
  ),
  "utf8",
);

test("Muelle Zulima and Apto. JC use the shared featured-project flow", () => {
  assert.match(panelSource, /data-featured-next-project/);
  assert.match(panelSource, /data-navbar-background="light"/);
  assert.match(panelSource, /<SectionTitleReveal/);
  assert.match(panelSource, /data-content-title-scope=\{`featured-project-\$\{project\.id\}`\}/);
  assert.match(panelSource, /visible=\{titleVisible\}/);
  assert.doesNotMatch(panelSource, /enabled=\{active\}/);
  assert.match(panelSource, /Muelle Zulima/);
  assert.match(panelSource, /Apto\. JC/);
  assert.match(panelSource, /<FeaturedProjectsGallery/);
  assert.match(panelSource, /backgroundClassName="bg-\[var\(--color-neutral-100-uniform\)\]"/);
  assert.match(panelSource, /columns=\{project\.columns\}/);
  assert.match(panelSource, /muelle-zulima-6\.webp/);
  assert.match(panelSource, /apto-jc-6\.webp/);
  assert.match(panelSource, /export \{ APTO_JC_PROJECT \}/);
});
