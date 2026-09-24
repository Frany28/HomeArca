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

const openingHomeSource = readFileSync(
  new URL("../src/pages/publicSite/home/OpeningHome.jsx", import.meta.url),
  "utf8",
);

const scrollVisibilitySource = readFileSync(
  new URL("../src/hooks/useScrollDirectionVisibility.js", import.meta.url),
  "utf8",
);

test("mobile navigation overlay blocks native touch panning", () => {
  assert.match(
    headerSource,
    /data-home-input-blocker=\{isMobileMenuOpen \? "" : undefined\}/,
  );
  assert.match(headerSource, /isMobileMenuOpen && "touch-none overscroll-none"/);
  assert.match(
    openingHomeSource,
    /initialScrollReady && !isMobileMenuOpen[\s\S]*?"overflow-y-auto"[\s\S]*?"overflow-y-hidden"/,
  );
  assert.match(
    openingHomeSource,
    /data-home-input-locked=\{isMobileMenuOpen \? "true" : undefined\}/,
  );
  assert.match(
    openingHomeSource,
    /isMobileMenuOpen \? "overscroll-y-none" : "overscroll-y-contain"/,
  );
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


test("mobile menu keeps the public header visible while input is locked", () => {
  assert.match(
    headerSource,
    /useScrollDirectionVisibility\(headerRef, \{[\s\S]*?disabled: isMobileMenuOpen/,
  );
  assert.match(
    scrollVisibilitySource,
    /if \(disabled \|\| reduceMotion\) \{[\s\S]*?clearProps: "transform"/,
  );
  assert.match(
    scrollVisibilitySource,
    /\[disabled, reduceMotion, scrollContainerRef, targetRef\]/,
  );
  assert.match(mobileMenuSource, /pointer-events-auto/);
});


test("OpeningHome owns the mobile menu state and scrollability in the same render", () => {
  assert.match(
    openingHomeSource,
    /const \[isMobileMenuOpen, setIsMobileMenuOpen\] = useState\(false\)/,
  );
  assert.match(
    openingHomeSource,
    /isMobileMenuOpen=\{[\s\S]*?isMobileMenuOpen[\s\S]*?\}/,
  );
  assert.match(
    openingHomeSource,
    /onMobileMenuOpenChange=\{[\s\S]*?setIsMobileMenuOpen[\s\S]*?\}/,
  );
  assert.doesNotMatch(headerSource, /scroller\.style\.overflowY/);
  assert.doesNotMatch(headerSource, /scroller\.style\.touchAction/);
});
