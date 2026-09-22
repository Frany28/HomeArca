import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  PROCESS_MOBILE_QUERY,
  PROCESS_MOBILE_VIDEO_LIMIT,
  getVisibleProcessVideos,
} from "../src/pages/publicSite/processes/utils/processVideoVisibility.js";

const gridSource = readFileSync(
  new URL(
    "../src/pages/publicSite/processes/components/ProcessesVideoGrid.jsx",
    import.meta.url,
  ),
  "utf8",
);

const videos = Array.from({ length: 9 }, (_, index) => ({ id: index + 1 }));

test("mobile Processes mounts only the six cards visible in its layout", () => {
  assert.equal(PROCESS_MOBILE_QUERY, "(max-width: 767px)");
  assert.equal(PROCESS_MOBILE_VIDEO_LIMIT, 6);
  assert.deepEqual(
    getVisibleProcessVideos(videos, true),
    videos.slice(0, 6),
  );
});

test("tablet and desktop Processes keep all currently visible cards", () => {
  assert.equal(getVisibleProcessVideos(videos, false), videos);
});

test("Processes renders media only from the responsive visible collection", () => {
  assert.match(gridSource, /window\.matchMedia\(PROCESS_MOBILE_QUERY\)/);
  assert.match(gridSource, /visibleVideos\.map\(\(video, index\) =>/);
  assert.doesNotMatch(gridSource, /\{videos\.map\(/);
  assert.match(gridSource, /\{active \? \([\s\S]*?<video/);
  assert.match(gridSource, /<source src=\{video\.webm\} type="video\/webm"/);
  assert.doesNotMatch(gridSource, /video\.mp4/);
});
