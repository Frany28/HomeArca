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

test("the featured carousel delegates horizontal and vertical arbitration to native scrolling", () => {
  assert.match(
    openingHomeSource,
    /touch-none/,
  );
  assert.match(mobileCarouselSource, /className="[^"]*touch-auto/);
  assert.match(mobileCarouselSource, /overflow-x-auto/);
  assert.match(mobileCarouselSource, /data-native-horizontal-scroll/);
  assert.match(mobileCarouselSource, /onTouchStart=\{pauseAutoScroll\}/);
  assert.match(mobileCarouselSource, /onTouchCancel=\{resumeAutoScroll\}/);
  assert.doesNotMatch(mobileCarouselSource, /handlePointerMove/);
  assert.doesNotMatch(mobileCarouselSource, /setPointerCapture/);
  assert.doesNotMatch(mobileCarouselSource, /DRAG_MOMENTUM/);
  assert.doesNotMatch(mobileCarouselSource, /event\.preventDefault\(\)/);
});


test("mobile scrolling inside a featured project remains natively owned", () => {
  assert.match(
    inputGestureSource,
    /featuredExpansionEnabled:[\s\S]*coordination\.featured\.isExpansionEnabled\(\)/,
  );
  assert.match(
    inputGestureSource,
    /gestureOwner !== TOUCH_GESTURE_OWNERS\.CONTROLLED_VERTICAL/,
  );
  assert.doesNotMatch(inputGestureSource, /nativeTouchIntent/);
  assert.doesNotMatch(inputGestureSource, /handleNativeTouchScroll/);
  assert.doesNotMatch(inputGestureSource, /finishNativeFeaturedTouchGesture/);
  assert.doesNotMatch(contentScrollSource, /pinMobileProjectBoundary\(\)/);
  assert.doesNotMatch(contentScrollSource, /shouldDeferNativeContentSync/);
});

test("mobile native scroll observes the most visible project", () => {
  assert.match(featuredControllerSource, /if \(!isExpansionEnabled\(\)\)/);
  assert.match(featuredControllerSource, /const visibleHeight = Math\.max\(/);
  assert.match(featuredControllerSource, /commitProjectIndex\(mostVisibleIndex\)/);
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


test("services and Quinta keep native mobile scrolling without a forced section transition", () => {
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
  assert.doesNotMatch(observerSource, /activeSectionRef\.current === "services"/);
  assert.doesNotMatch(
    observerSource,
    /transitionBetweenSections\("featured-projects"/,
  );
  assert.match(
    observerSource,
    /activeFeaturedProjectIndexRef\.current === 0[\s\S]*direction < 0[\s\S]*return false/,
  );
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
  assert.doesNotMatch(
    featuredControllerSource,
    /requestAnimationFrame\(\(\) => \{[\s\S]*boundary\.transition\(\)/,
  );
});


test("mobile boundary transitions preserve the standard section speed after native overshoot", () => {
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
    /activeSectionId === "featured-projects"[\s\S]*"touch-auto min-\[1024px\]:touch-pan-x"/,
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
