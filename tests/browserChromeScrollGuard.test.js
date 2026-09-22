import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { shouldRestoreBrowserChromeScroll } from "../src/pages/publicSite/home/utils/browserChromeScrollGuard.js";

const guardSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/hooks/useBrowserChromeScrollGuard.js",
    import.meta.url,
  ),
  "utf8",
);

const openingHomeSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/OpeningHome.jsx",
    import.meta.url,
  ),
  "utf8",
);

test("browser chrome scroll is restored while the page does not own focus", () => {
  assert.equal(
    shouldRestoreBrowserChromeScroll({
      browserChromeActive: true,
      documentFocused: false,
      nextScrollTop: 0,
      preservedScrollTop: 1800,
    }),
    true,
  );

  assert.equal(
    shouldRestoreBrowserChromeScroll({
      browserChromeActive: true,
      documentFocused: true,
      nextScrollTop: 900,
      preservedScrollTop: 1800,
    }),
    true,
  );
});

test("a focused page keeps legitimate navigation to Home", () => {
  assert.equal(
    shouldRestoreBrowserChromeScroll({
      browserChromeActive: false,
      documentFocused: true,
      nextScrollTop: 0,
      preservedScrollTop: 1800,
    }),
    false,
  );
});

test("the guard observes browser chrome and page intent without preventing gestures", () => {
  assert.match(guardSource, /window\.addEventListener\("blur", armGuard, true\)/);
  assert.match(guardSource, /document\.addEventListener\("visibilitychange"/);
  assert.match(guardSource, /document\.addEventListener\("pointerdown", notePageIntent, true\)/);
  assert.match(guardSource, /scroller\.addEventListener\("wheel", notePageIntent/);
  assert.match(guardSource, /event\.stopImmediatePropagation\(\)/);
  assert.doesNotMatch(guardSource, /preventDefault\(/);
  assert.match(openingHomeSource, /useBrowserChromeScrollGuard\(\{/);
});
