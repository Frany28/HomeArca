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

test("the featured carousel separates horizontal dragging from vertical page scrolling", () => {
  assert.match(
    openingHomeSource,
    /touch-auto min-\[1024px\]:touch-pan-x/,
  );
  assert.match(mobileCarouselSource, /className="[^"]*touch-pan-y/);
  assert.match(mobileCarouselSource, /handlePointerMove/);
  assert.match(mobileCarouselSource, /Math\.abs\(deltaX\) <= Math\.abs\(deltaY\)/);
  assert.match(mobileCarouselSource, /scrollLeft = drag\.startScrollLeft - deltaX/);
  assert.match(mobileCarouselSource, /onTouchCancel=\{resumeAutoScroll\}/);
});


test("mobile featured touch owns boundary transitions before content synchronization", () => {
  const touchScrollListener = inputGestureSource.indexOf(
    'addEventListener("scroll", handleNativeTouchScroll',
  );
  const contentScrollListener = inputGestureSource.indexOf(
    'addEventListener("scroll", coordination.content.handleNativeScroll',
  );

  assert.notEqual(touchScrollListener, -1);
  assert.notEqual(contentScrollListener, -1);
  assert.ok(touchScrollListener < contentScrollListener);
  assert.match(inputGestureSource, /shouldDeferNativeContentSync/);
  assert.match(
    contentScrollSource,
    /coordination\.input\?\.shouldDeferNativeContentSync\?\.\(\)/,
  );
});
