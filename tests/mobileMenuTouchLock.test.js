import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const headerSource = readFileSync(
  new URL(
    "../src/pages/publicSite/components/PublicSiteHeader/PublicSiteHeader.jsx",
    import.meta.url,
  ),
  "utf8",
);

const mobileMenuSource = readFileSync(
  new URL(
    "../src/pages/publicSite/components/PublicSiteHeader/PublicSiteMobileMenu.jsx",
    import.meta.url,
  ),
  "utf8",
);

const inputGestureSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/hooks/homeScroll/createInputGestureController.js",
    import.meta.url,
  ),
  "utf8",
);

test("mobile navigation overlay blocks native touch panning", () => {
  assert.match(
    headerSource,
    /data-home-input-blocker=\{isMobileMenuOpen \? "" : undefined\}/,
  );
  assert.match(headerSource, /isMobileMenuOpen && "touch-none overscroll-none"/);
  assert.match(headerSource, /scroller\.style\.overflowY = "hidden"/);
  assert.match(headerSource, /scroller\.style\.touchAction = "none"/);
  assert.match(headerSource, /scroller\.dataset\.homeInputLocked = "true"/);
  assert.match(headerSource, /delete scroller\.dataset\.homeInputLocked/);
  assert.match(mobileMenuSource, /data-home-input-blocker/);
  assert.match(mobileMenuSource, /touch-none/);
  assert.match(mobileMenuSource, /overscroll-none/);
});

test("home gesture controller ignores input that starts inside the mobile menu", () => {
  assert.match(
    inputGestureSource,
    /target\.closest\("\[data-home-input-blocker\]"\)/,
  );
  assert.match(
    inputGestureSource,
    /const handleBoundaryTouchStart = \(event\) => \{[\s\S]*?isInputBlockedTarget\(event\.target\)/,
  );
  assert.match(
    inputGestureSource,
    /const handlePointerDown = \(event\) => \{[\s\S]*?isInputBlockedTarget\(event\.target\)/,
  );
  assert.match(
    inputGestureSource,
    /const handleNativeTouchStart = \(event\) => \{[\s\S]*?isInputBlockedTarget\(event\.target\)/,
  );
  assert.match(
    inputGestureSource,
    /scroller\.dataset\.homeInputLocked === "true"/,
  );
  assert.match(
    inputGestureSource,
    /const handlePointerMove = \(event\) => \{[\s\S]*?if \(isHomeInputLocked\(\)\)/,
  );
  assert.match(
    inputGestureSource,
    /const handleBoundaryTouchMove = \(event\) => \{[\s\S]*?if \(isHomeInputLocked\(\)\)/,
  );
});
