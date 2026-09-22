import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

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

test("the featured carousel separates horizontal dragging from vertical page scrolling", () => {
  assert.match(
    openingHomeSource,
    /touch-auto min-\[1024px\]:touch-pan-x/,
  );
  assert.match(mobileCarouselSource, /className="[^"]*touch-pan-y/);
  assert.match(mobileCarouselSource, /handlePointerMove/);
  assert.match(mobileCarouselSource, /Math\.abs\(deltaX\) <= Math\.abs\(deltaY\)/);
  assert.match(mobileCarouselSource, /targetScrollLeft = drag\.startScrollLeft - deltaX/);
  assert.match(mobileCarouselSource, /onTouchCancel=\{resumeAutoScroll\}/);
});


test("mobile featured vertical navigation is owned only by native scroll", () => {
  assert.match(
    inputGestureSource,
    /if \(!coordination\.featured\.isExpansionEnabled\(\)\) return;/,
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
