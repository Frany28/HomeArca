import assert from "node:assert/strict";
import test from "node:test";

import {
  advanceCarouselAutoPosition,
  canResumeCarouselAutoScroll,
  canWriteCarouselAutoScroll,
  normalizeCarouselLoopPosition,
  resolveCarouselGestureAxis,
} from "../src/pages/publicSite/featuredProjects/utils/carouselAutoScroll.js";
import {
  TOUCH_GESTURE_OWNERS,
  clearTouchGestureForPointer,
  getTouchGestureOwner,
} from "../src/pages/publicSite/home/utils/touchGestureOwnership.js";

test("mobile Featured keeps vertical movement browser-owned when expansion is disabled", () => {
  assert.equal(
    getTouchGestureOwner({
      contentMode: true,
      featuredProjectReady: true,
      featuredExpansionEnabled: false,
    }),
    TOUCH_GESTURE_OWNERS.NATIVE_VERTICAL,
  );
});

test("Featured expansion remains controlled only where the expansion effect exists", () => {
  assert.equal(
    getTouchGestureOwner({
      contentMode: true,
      featuredProjectReady: true,
      featuredExpansionEnabled: true,
    }),
    TOUCH_GESTURE_OWNERS.CONTROLLED_VERTICAL,
  );
});

test("the mobile carousel remains a browser-owned horizontal region", () => {
  assert.equal(
    getTouchGestureOwner({
      contentMode: true,
      featuredProjectReady: true,
      featuredExpansionEnabled: false,
      nativeHorizontalTarget: true,
    }),
    TOUCH_GESTURE_OWNERS.NATIVE_HORIZONTAL,
  );
});

test("pointer cancellation clears only the matching controlled gesture", () => {
  const gesture = { pointerId: 7 };

  assert.equal(clearTouchGestureForPointer(gesture, 7), null);
  assert.equal(clearTouchGestureForPointer(gesture, 8), gesture);
});

test("carousel autoplay writes only outside real user interaction", () => {
  assert.equal(
    canWriteCarouselAutoScroll({ paused: true }),
    false,
  );
  assert.equal(
    canWriteCarouselAutoScroll({ interactionActive: true }),
    false,
  );
  assert.equal(
    canWriteCarouselAutoScroll({
      interactionActive: false,
      paused: false,
    }),
    true,
  );
});

test("carousel autoplay keeps subpixel progress independent from DOM scrollLeft rounding", () => {
  let position = 0;

  for (let frame = 0; frame < 5; frame += 1) {
    position = advanceCarouselAutoPosition(
      position,
      1 / 60,
      1000,
      24,
    );
  }

  assert.ok(position > 1.9 && position < 2.1);
});

test("carousel autoplay wraps continuously at the duplicated-set boundary", () => {
  assert.equal(
    advanceCarouselAutoPosition(999, 1, 1000, 24),
    23,
  );
});

test("carousel gesture axis waits for intent and locks to the dominant direction", () => {
  assert.equal(resolveCarouselGestureAxis(3, 2), null);
  assert.equal(resolveCarouselGestureAxis(20, 4), "horizontal");
  assert.equal(resolveCarouselGestureAxis(4, 20), "vertical");
  assert.equal(resolveCarouselGestureAxis(20, 19), null);
});

test("manual horizontal carousel movement wraps seamlessly across the repeated set", () => {
  assert.equal(normalizeCarouselLoopPosition(1024, 1000), 24);
  assert.equal(normalizeCarouselLoopPosition(-24, 1000), 976);
  assert.equal(normalizeCarouselLoopPosition(350, 1000), 350);
});

test("carousel autoplay can resume only after interaction and scroll settle", () => {
  assert.equal(
    canResumeCarouselAutoScroll({
      interactionActive: true,
      scrollSettled: true,
    }),
    false,
  );
  assert.equal(
    canResumeCarouselAutoScroll({
      interactionActive: false,
      scrollSettled: true,
    }),
    true,
  );
});
