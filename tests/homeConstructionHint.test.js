import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hintSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/components/HomeScrollHint/HomeScrollHint.jsx",
    import.meta.url,
  ),
  "utf8",
);
const panelSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/components/HomeScrollPanel/HomeScrollPanel.jsx",
    import.meta.url,
  ),
  "utf8",
);
const sectionsSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/components/HomeSections.jsx",
    import.meta.url,
  ),
  "utf8",
);
const statementPanelSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/components/HomeStatementPanel/HomeStatementPanel.jsx",
    import.meta.url,
  ),
  "utf8",
);
const inputControllerSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/hooks/homeScroll/createInputGestureController.js",
    import.meta.url,
  ),
  "utf8",
);
const contentControllerSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/hooks/homeScroll/createContentScrollController.js",
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

test("the Construction scroll hint appears on panel arrival and is bottom-centered on mobile", () => {
  assert.match(
    hintSource,
    /bottom-\[51px\] left-1\/2[^"]*-translate-x-1\/2[^"]*min-\[768px\]:right-\[51px\]/,
  );
  assert.match(
    panelSource,
    /scrollHintVariant === "edge"\s*\? active\s*:\s*titleVisible && scrollHintVisible/,
  );
  assert.match(
    sectionsSource,
    /active=\{active && navigationState\.panelIndex === panelIndex\}/,
  );
});

test("the final statement shows the same hint only after its phrase is fully revealed", () => {
  assert.match(
    statementPanelSource,
    /statementVisible && <HomeScrollHint variant="edge" \/>/,
  );
  assert.match(
    sectionsSource,
    /statementVisible=\{[\s\S]*navigationState\.phase === HOME_SCROLL_PHASES\.TITLE/,
  );
});

test("title reveal completion requires a fresh wheel gesture", () => {
  assert.match(inputControllerSource, /requireFreshWheelGesture/);
  assert.match(inputControllerSource, /"BLOCKED_TITLE_REVEAL"/);
  assert.doesNotMatch(
    inputControllerSource,
    /pendingPanelDirectionRef|QUEUED_TITLE_REVEAL/,
  );
});

test("programmatic panel scroll cannot reveal Construction as a second gesture", () => {
  assert.match(
    panelControllerSource,
    /onComplete: \(\) => \{\s*runtime\.activeTween = undefined;\s*runtime\.requestAnimationFrame\(completeAlignment\);/,
  );
  assert.match(
    contentControllerSource,
    /const handleScrollEnd = \(\) => \{\s*if \(runtime\.isProgrammaticScroll \|\| runtime\.activeTween\) return;[\s\S]*flushMobileNativeBoundaryTransition\(\)[\s\S]*if \(runtime\.ignoreNextScrollEnd\)/,
  );
});
