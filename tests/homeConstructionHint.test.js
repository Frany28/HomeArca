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
const inputControllerSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/hooks/homeScroll/createInputGestureController.js",
    import.meta.url,
  ),
  "utf8",
);

test("the Construction scroll hint appears early and is bottom-centered on mobile", () => {
  assert.match(
    hintSource,
    /bottom-\[51px\] left-1\/2[^"]*-translate-x-1\/2[^"]*min-\[768px\]:right-\[51px\]/,
  );
  assert.match(panelSource, /scrollHintVariant === "edge" \|\| scrollHintVisible/);
});

test("title reveal completion requires a fresh wheel gesture", () => {
  assert.match(inputControllerSource, /requireFreshWheelGesture/);
  assert.match(inputControllerSource, /"BLOCKED_TITLE_REVEAL"/);
  assert.doesNotMatch(
    inputControllerSource,
    /pendingPanelDirectionRef|QUEUED_TITLE_REVEAL/,
  );
});
