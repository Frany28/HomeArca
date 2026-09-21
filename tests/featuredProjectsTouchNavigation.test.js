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

test("the featured carousel supports native horizontal drag and vertical scrolling", () => {
  assert.match(
    openingHomeSource,
    /touch-auto min-\[1024px\]:touch-pan-x/,
  );
  assert.match(mobileCarouselSource, /className="[^"]*touch-auto/);
  assert.doesNotMatch(mobileCarouselSource, /touch-pan-y/);
  assert.match(mobileCarouselSource, /event\.pointerType !== "touch"/);
  assert.match(mobileCarouselSource, /onTouchCancel=\{resumeAutoScroll\}/);
});
