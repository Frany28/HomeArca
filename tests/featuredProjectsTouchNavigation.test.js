import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  getNativeBoundaryCrossingDirection,
} from "../src/pages/publicSite/home/hooks/homeScroll/createFeaturedProjectsController.js";

const openingHomeSource = readFileSync(
  new URL("../src/pages/publicSite/home/OpeningHome.jsx", import.meta.url),
  "utf8",
);
const mobileCarouselSource = readFileSync(
  new URL(
    "../src/pages/publicSite/featuredProjects/components/FeaturedProjectsMobileCarousel.jsx",
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
const contentScrollSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/hooks/homeScroll/createContentScrollController.js",
    import.meta.url,
  ),
  "utf8",
);
const featuredControllerSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/hooks/homeScroll/createFeaturedProjectsController.js",
    import.meta.url,
  ),
  "utf8",
);
const panelControllerSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/hooks/homeScroll/createPanelNavigationController.js",
    import.meta.url,
  ),
  "utf8",
);

test("the featured carousel keeps horizontal scrolling native", () => {
  assert.match(
    openingHomeSource,
    /touch-none/,
  );
  assert.match(mobileCarouselSource, /className="[^"]*touch-pan-x/);
  assert.match(mobileCarouselSource, /overflow-x-auto/);
  assert.match(mobileCarouselSource, /data-native-horizontal-scroll/);
  assert.match(mobileCarouselSource, /onTouchStart=\{beginUserInteraction\}/);
  assert.match(mobileCarouselSource, /onTouchCancel=\{endUserInteraction\}/);
  assert.match(mobileCarouselSource, /addEventListener\("scroll", handleCarouselScroll/);
  assert.match(mobileCarouselSource, /addEventListener\("scrollend", handleCarouselScrollEnd\)/);
  assert.doesNotMatch(mobileCarouselSource, /handlePointerMove/);
  assert.doesNotMatch(mobileCarouselSource, /setPointerCapture/);
  assert.doesNotMatch(mobileCarouselSource, /DRAG_MOMENTUM/);
  assert.doesNotMatch(mobileCarouselSource, /event\.preventDefault\(\)/);
});


test("mobile Featured vertical scrolling is controlled without manual carousel dragging", () => {
  assert.match(
    inputGestureSource,
    /featuredControlledMobile: !featuredExpansionEnabled/,
  );
  assert.match(
    inputGestureSource,
    /advanceControlledFeaturedTouchGesture\(/,
  );
  assert.match(inputGestureSource, /scroller\.scrollTop = update\.scrollTop/);
  assert.doesNotMatch(inputGestureSource, /scrollLeft\s*=/);
  assert.doesNotMatch(inputGestureSource, /setPointerCapture/);
  assert.doesNotMatch(inputGestureSource, /nativeTouchIntent/);
  assert.doesNotMatch(inputGestureSource, /handleNativeTouchScroll/);
  assert.doesNotMatch(inputGestureSource, /finishNativeFeaturedTouchGesture/);
  assert.doesNotMatch(contentScrollSource, /pinMobileProjectBoundary\(\)/);
  assert.doesNotMatch(contentScrollSource, /shouldDeferNativeContentSync/);
});

test("native boundary observation exits while Featured owns vertical movement", () => {
  const observerStart = featuredControllerSource.indexOf(
    "const observeMobileNativeBoundaryScroll",
  );
  const observerEnd = featuredControllerSource.indexOf(
    "const handleExpansionInput",
    observerStart,
  );
  const observerSource = featuredControllerSource.slice(
    observerStart,
    observerEnd,
  );

  assert.match(
    observerSource,
    /activeSectionRef\.current === "featured-projects"[\s\S]*return false/,
  );
  assert.ok(
    observerSource.indexOf('activeSectionRef.current === "featured-projects"') <
      observerSource.indexOf("getContentBoundary("),
  );
  assert.match(
    inputGestureSource,
    /addEventListener\("scroll", coordination\.content\.handleNativeScroll/,
  );
  assert.match(
    contentScrollSource,
    /selectSection\(activeContentSection\?\.id \?\? "services"\)/,
  );
});

test("native scroll starts one transition only when it crosses a real boundary", () => {
  const bounds = { start: 400, end: 900 };

  assert.equal(getNativeBoundaryCrossingDirection(700, 760, bounds), 0);
  assert.equal(getNativeBoundaryCrossingDirection(880, 900, bounds), 1);
  assert.equal(getNativeBoundaryCrossingDirection(900, 920, bounds), 1);
  assert.equal(getNativeBoundaryCrossingDirection(440, 400, bounds), -1);
  assert.equal(getNativeBoundaryCrossingDirection(400, 380, bounds), -1);
  assert.equal(getNativeBoundaryCrossingDirection(700, 650, bounds), 0);
});

test("mobile boundary transitions observe scroll before content synchronization", () => {
  const observerCall = contentScrollSource.indexOf(
    "coordination.featured.observeMobileNativeBoundaryScroll();",
  );
  const programmaticGuard = contentScrollSource.indexOf(
    "if (runtime.isProgrammaticScroll)",
  );
  const contentSync = contentScrollSource.indexOf(
    "synchronizeContentScroll();",
    programmaticGuard,
  );

  assert.notEqual(observerCall, -1);
  assert.ok(observerCall < programmaticGuard);
  assert.ok(observerCall < contentSync);
  assert.match(
    featuredControllerSource,
    /\(max-width: 1023px\) and \(pointer: coarse\)/,
  );
  assert.match(featuredControllerSource, /runtime\.activeTween \|\|/);
  assert.match(featuredControllerSource, /deferStateCommit: true/);
  assert.doesNotMatch(inputGestureSource, /nativeTouchIntent/);
});


test("native mobile boundary handoff is scoped to Process returning into Featured", () => {
  const observerStart = featuredControllerSource.indexOf(
    "const observeMobileNativeBoundaryScroll",
  );
  const observerEnd = featuredControllerSource.indexOf(
    "const handleExpansionInput",
    observerStart,
  );
  const observerSource = featuredControllerSource.slice(
    observerStart,
    observerEnd,
  );

  assert.notEqual(observerStart, -1);
  assert.notEqual(observerEnd, -1);
  assert.match(
    observerSource,
    /activeSectionRef\.current !== "process"\) return false/,
  );
  assert.doesNotMatch(observerSource, /activeSectionRef\.current === "services"/);
});

test("mobile boundary transitions reuse the standard section navigation motion", () => {
  assert.doesNotMatch(
    featuredControllerSource,
    /MOBILE_BOUNDARY_TRANSITION_(DURATION|EASE)/,
  );
  assert.match(
    panelControllerSource,
    /duration = SCROLL_STEP_DURATION_SECONDS/,
  );
  assert.match(
    panelControllerSource,
    /duration,/,
  );
  assert.match(
    panelControllerSource,
    /ease: SECTION_NAVIGATION_EASE/,
  );
});


test("mobile boundary handoff waits for native scroll settlement before GSAP takes ownership", () => {
  assert.match(
    featuredControllerSource,
    /mobileBoundaryTransitionPending = \{[\s\S]*transition: boundary\.transition/,
  );
  assert.match(
    featuredControllerSource,
    /scheduleMobileBoundaryTransition\(\)/,
  );
  assert.match(
    featuredControllerSource,
    /SCROLL_SETTLE_DELAY_MS/,
  );
  assert.match(
    contentScrollSource,
    /handleScrollEnd[\s\S]*flushMobileNativeBoundaryTransition\(\)/,
  );
  const observerStart = featuredControllerSource.indexOf(
    "const observeMobileNativeBoundaryScroll",
  );
  const observerEnd = featuredControllerSource.indexOf(
    "const handleExpansionInput",
    observerStart,
  );
  const observerSource = featuredControllerSource.slice(
    observerStart,
    observerEnd,
  );

  assert.doesNotMatch(observerSource, /requestAnimationFrame/);
});


test("Process native handoff preserves the standard section speed after overshoot", () => {
  assert.match(
    featuredControllerSource,
    /const getMobileTransitionDuration = \(targetScrollTop\) =>/,
  );
  assert.match(
    featuredControllerSource,
    /SCROLL_STEP_DURATION_SECONDS \* distanceRatio/,
  );
  assert.match(
    featuredControllerSource,
    /duration: deferStateCommit[\s\S]*getMobileTransitionDuration\(transition\.scrollTop\)/,
  );
  assert.match(
    featuredControllerSource,
    /duration: deferStateCommit[\s\S]*getMobileTransitionDuration\(targetScrollTop\)/,
  );
  assert.match(
    panelControllerSource,
    /duration = SCROLL_STEP_DURATION_SECONDS/,
  );
  assert.match(
    panelControllerSource,
    /ease: SECTION_NAVIGATION_EASE/,
  );
});


test("controlled Home panels fully own touch gestures before native content scrolling", () => {
  assert.match(
    openingHomeSource,
    /!contentScrollActive\s*\? "touch-none"/,
  );
  assert.match(
    openingHomeSource,
    /activeSectionId === "featured-projects"[\s\S]*"touch-pan-x min-\[1024px\]:touch-auto"[\s\S]*"touch-pan-x"/,
  );
});


test("controlled touch ignores browser-owned targets and resets stale gestures", () => {
  assert.match(
    inputGestureSource,
    /getTouchGestureOwner\(\{/,
  );
  assert.match(
    inputGestureSource,
    /nativeHorizontalTarget: isNativeHorizontalTarget\(event\.target\)/,
  );
  assert.match(
    inputGestureSource,
    /addEventListener\("lostpointercapture", resetTouchGesture\)/,
  );
  assert.match(
    inputGestureSource,
    /window\.addEventListener\("blur", resetTouchGesture\)/,
  );
  assert.match(
    inputGestureSource,
    /document\.addEventListener\("visibilitychange", handleVisibilityChange\)/,
  );
});
