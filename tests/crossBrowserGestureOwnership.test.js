import assert from "node:assert/strict";
import test from "node:test";

import {
  TOUCH_GESTURE_OWNERS,
  getTouchGestureOwner,
} from "../src/pages/publicSite/home/utils/touchGestureOwnership.js";
import {
  VIEWPORT_RESIZE_KINDS,
  classifyViewportResize,
} from "../src/pages/publicSite/home/utils/viewportResize.js";

test("controlled Home panels keep vertical touch ownership", () => {
  assert.equal(
    getTouchGestureOwner({ contentMode: false }),
    TOUCH_GESTURE_OWNERS.CONTROLLED_VERTICAL,
  );
});

test("content scrolling stays browser-owned unless a concrete featured effect owns it", () => {
  assert.equal(
    getTouchGestureOwner({ contentMode: true }),
    TOUCH_GESTURE_OWNERS.NATIVE_VERTICAL,
  );

  assert.equal(
    getTouchGestureOwner({
      contentMode: true,
      featuredProjectReady: true,
      featuredExpansionEnabled: false,
    }),
    TOUCH_GESTURE_OWNERS.CONTROLLED_VERTICAL,
  );

  assert.equal(
    getTouchGestureOwner({
      contentMode: true,
      featuredProjectReady: true,
      featuredExpansionEnabled: true,
    }),
    TOUCH_GESTURE_OWNERS.CONTROLLED_VERTICAL,
  );
});

test("native horizontal regions and interactive controls never enter controlled navigation", () => {
  assert.equal(
    getTouchGestureOwner({
      contentMode: true,
      featuredProjectReady: true,
      featuredExpansionEnabled: true,
      nativeHorizontalTarget: true,
    }),
    TOUCH_GESTURE_OWNERS.NATIVE_HORIZONTAL,
  );

  assert.equal(
    getTouchGestureOwner({
      contentMode: false,
      interactiveTarget: true,
    }),
    TOUCH_GESTURE_OWNERS.NATIVE_VERTICAL,
  );
});

test("mobile browser chrome height changes are not treated as layout changes", () => {
  assert.equal(
    classifyViewportResize({
      previousWidth: 390,
      previousHeight: 750,
      nextWidth: 390,
      nextHeight: 810,
      hasVisualViewport: true,
      coarsePointer: true,
    }),
    VIEWPORT_RESIZE_KINDS.TRANSIENT_MOBILE_HEIGHT,
  );
});

test("orientation and desktop resizes remain layout changes", () => {
  assert.equal(
    classifyViewportResize({
      previousWidth: 390,
      previousHeight: 810,
      nextWidth: 810,
      nextHeight: 390,
      hasVisualViewport: true,
      coarsePointer: true,
    }),
    VIEWPORT_RESIZE_KINDS.LAYOUT,
  );

  assert.equal(
    classifyViewportResize({
      previousWidth: 1280,
      previousHeight: 800,
      nextWidth: 1280,
      nextHeight: 700,
      hasVisualViewport: true,
      coarsePointer: false,
    }),
    VIEWPORT_RESIZE_KINDS.LAYOUT,
  );
});
