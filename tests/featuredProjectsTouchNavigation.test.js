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
