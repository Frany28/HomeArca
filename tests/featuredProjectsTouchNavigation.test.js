import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  getNativeBoundaryCrossingDirection,
  isTouchCapableMobileLayout,
  shouldActivateIncomingFeaturedBeforeTransition,
  shouldActivateIncomingProjectBeforeTransition,
  shouldFlushMobileBoundaryImmediately,
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

test("the featured carousel is not a scroll container and never owns vertical movement", () => {
  assert.match(openingHomeSource, /touch-none/);
  assert.match(mobileCarouselSource, /className="[^"]*touch-pan-y[^"]*overflow-clip/);
  assert.doesNotMatch(mobileCarouselSource, /overflow-x-(auto|scroll|hidden)/);
  assert.doesNotMatch(mobileCarouselSource, /overflow-y-(auto|scroll|hidden)/);
  assert.doesNotMatch(mobileCarouselSource, /data-native-horizontal-scroll/);
  assert.match(mobileCarouselSource, /data-featured-gallery-carousel-track/);
  assert.match(mobileCarouselSource, /resolveCarouselGestureAxis/);
  assert.match(mobileCarouselSource, /onPointerMove=\{handlePointerMove\}/);
  assert.match(mobileCarouselSource, /drag\.axis !== "horizontal"/);
  assert.match(mobileCarouselSource, /writeCarouselPosition/);
  assert.match(mobileCarouselSource, /translate3d/);
  assert.doesNotMatch(mobileCarouselSource, /scrollLeft/);
  assert.doesNotMatch(mobileCarouselSource, /event\.preventDefault\(\)/);
  assert.doesNotMatch(mobileCarouselSource, /setPointerCapture/);
  assert.doesNotMatch(mobileCarouselSource, /-webkit-overflow-scrolling:touch/);
});

test("mobile Featured vertical movement is no longer simulated with pointermove", () => {
  assert.doesNotMatch(inputGestureSource, /featuredControlledMobile/);
  assert.doesNotMatch(
    inputGestureSource,
    /advanceControlledFeaturedTouchGesture\(/,
  );
  assert.doesNotMatch(
    inputGestureSource,
    /pendingFeaturedAxis/,
  );
  assert.doesNotMatch(
    inputGestureSource,
    /scroller\.scrollTop = update\.scrollTop/,
  );
  assert.doesNotMatch(inputGestureSource, /scrollLeft\s*=/);
  assert.doesNotMatch(inputGestureSource, /setPointerCapture/);
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

test("mobile native boundary observation covers Featured and Process", () => {
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
    /activeSectionRef\.current !== "featured-projects"[\s\S]*activeSectionRef\.current !== "process"/,
  );
  assert.doesNotMatch(
    observerSource,
    /activeSectionRef\.current === "featured-projects"[\s\S]*clearMobileBoundaryTransition\(\)[\s\S]*return false/,
  );
});

test("Safari momentum is pinned only after a real Featured boundary is crossed", () => {
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
    featuredControllerSource,
    /const pinMobileBoundaryScroll = \(scrollTop\) =>/,
  );
  assert.match(
    observerSource,
    /mobileBoundaryTransitionPending = \{[\s\S]*scrollTop: boundary\.scrollTop,[\s\S]*transition: boundary\.transition/,
  );
  assert.match(
    observerSource,
    /pinMobileBoundaryScroll\(boundary\.scrollTop\)/,
  );
  assert.match(
    observerSource,
    /mobileBoundaryTransitionPending\.scrollTop/,
  );
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
    /\(max-width: 1023px\)/,
  );
  assert.match(featuredControllerSource, /\(pointer: coarse\)/);
  assert.match(featuredControllerSource, /\(any-pointer: coarse\)/);
  assert.match(featuredControllerSource, /navigator\.maxTouchPoints/);
  assert.match(featuredControllerSource, /deferStateCommit: true/);
});

test("Android touch layouts are recognized even when the primary pointer is not reported coarse", () => {
  assert.equal(
    isTouchCapableMobileLayout({
      matchesMobileWidth: true,
      primaryPointerCoarse: false,
      anyPointerCoarse: true,
      maxTouchPoints: 0,
    }),
    true,
  );

  assert.equal(
    isTouchCapableMobileLayout({
      matchesMobileWidth: true,
      primaryPointerCoarse: false,
      anyPointerCoarse: false,
      maxTouchPoints: 5,
    }),
    true,
  );

  assert.equal(
    isTouchCapableMobileLayout({
      matchesMobileWidth: false,
      primaryPointerCoarse: true,
      anyPointerCoarse: true,
      maxTouchPoints: 5,
    }),
    false,
  );
});

test("mobile touch project identity is committed by transitions, not most-visible scroll math", () => {
  const syncStart = featuredControllerSource.indexOf(
    "const synchronizeProject",
  );
  const syncEnd = featuredControllerSource.indexOf(
    "const transitionProject",
    syncStart,
  );
  const syncSource = featuredControllerSource.slice(syncStart, syncEnd);

  assert.match(
    syncSource,
    /if \(isMobileTouchLayout\(\)\) return;/,
  );
  assert.ok(
    syncSource.indexOf("if (isMobileTouchLayout()) return;") <
      syncSource.indexOf("mostVisibleIndex"),
  );
});

test("the first Featured project can still flow naturally back into Services", () => {
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
    /activeFeaturedProjectIndexRef\.current === 0[\s\S]*direction < 0[\s\S]*return false/,
  );
});

test("mobile upward project transitions activate the incoming project before the tween starts", () => {
  assert.equal(
    shouldActivateIncomingProjectBeforeTransition({
      deferStateCommit: true,
      direction: -1,
    }),
    true,
  );
  assert.equal(
    shouldActivateIncomingProjectBeforeTransition({
      deferStateCommit: true,
      direction: 1,
    }),
    false,
  );
  assert.equal(
    shouldActivateIncomingProjectBeforeTransition({
      deferStateCommit: false,
      direction: -1,
    }),
    false,
  );

  const transitionStart = featuredControllerSource.indexOf(
    "const transitionProject",
  );
  const transitionEnd = featuredControllerSource.indexOf(
    "const transitionBetweenSections",
    transitionStart,
  );
  const transitionSource = featuredControllerSource.slice(
    transitionStart,
    transitionEnd,
  );

  const activateIncoming = transitionSource.indexOf(
    "commitProjectIndex(transition.index);",
  );
  const startScrollTransition = transitionSource.indexOf(
    "coordination.panel.startScrollTransition",
  );

  assert.ok(activateIncoming >= 0);
  assert.ok(startScrollTransition >= 0);
  assert.ok(activateIncoming < startScrollTransition);
});

test("Process -> Apto activates Featured when the controlled return transition starts", () => {
  assert.equal(
    shouldActivateIncomingFeaturedBeforeTransition({
      activeSectionId: "process",
      featuredProjectIndex: 2,
      targetAlignment: "end",
      targetSectionId: "featured-projects",
    }),
    true,
  );

  assert.equal(
    shouldActivateIncomingFeaturedBeforeTransition({
      activeSectionId: "featured-projects",
      featuredProjectIndex: 2,
      targetAlignment: "end",
      targetSectionId: "process",
    }),
    false,
  );

  const transitionStart = featuredControllerSource.indexOf(
    "const transitionBetweenSections",
  );
  const transitionEnd = featuredControllerSource.indexOf(
    "const getExpansionAnchor",
    transitionStart,
  );
  const transitionSource = featuredControllerSource.slice(
    transitionStart,
    transitionEnd,
  );

  const activateTarget = transitionSource.indexOf(
    "coordination.content.selectSection(targetSectionId);",
  );
  const startScrollTransition = transitionSource.indexOf(
    "coordination.panel.startScrollTransition",
  );

  assert.ok(activateTarget >= 0);
  assert.ok(startScrollTransition >= 0);
  assert.ok(activateTarget < startScrollTransition);
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
  assert.match(panelControllerSource, /ease: SECTION_NAVIGATION_EASE/);
});

test("mobile upward boundary handoff starts immediately while downward waits for settle", () => {
  assert.equal(shouldFlushMobileBoundaryImmediately(-1), true);
  assert.equal(shouldFlushMobileBoundaryImmediately(1), false);
  assert.equal(shouldFlushMobileBoundaryImmediately(0), false);

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
    /shouldFlushMobileBoundaryImmediately\(crossingDirection\)[\s\S]*flushMobileNativeBoundaryTransition\(\)/,
  );
  assert.match(
    observerSource,
    /scheduleMobileBoundaryTransition\(\)/,
  );
  assert.match(featuredControllerSource, /SCROLL_SETTLE_DELAY_MS/);
  assert.match(
    contentScrollSource,
    /handleScrollEnd[\s\S]*flushMobileNativeBoundaryTransition\(\)/,
  );
  assert.doesNotMatch(observerSource, /requestAnimationFrame/);
});

test("mobile downward boundary handoff still waits for native momentum to settle", () => {
  assert.match(
    featuredControllerSource,
    /scheduleMobileBoundaryTransition\(\)/,
  );
  assert.match(featuredControllerSource, /SCROLL_SETTLE_DELAY_MS/);
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

test("native handoff preserves the standard section speed", () => {
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
    panelControllerSource,
    /duration = SCROLL_STEP_DURATION_SECONDS/,
  );
  assert.match(panelControllerSource, /ease: SECTION_NAVIGATION_EASE/);
});

test("controlled intro panels stay controlled while Featured mobile stays native", () => {
  assert.match(
    openingHomeSource,
    /!contentScrollActive\s*\? "touch-none"/,
  );
  assert.match(
    openingHomeSource,
    /activeSectionId === "featured-projects" && !reduceMotion[\s\S]*"touch-auto min-\[1024px\]:touch-pan-x"/,
  );
});

test("controlled touch ignores browser-owned targets and resets stale gestures", () => {
  assert.match(inputGestureSource, /getTouchGestureOwner\(\{/);
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
