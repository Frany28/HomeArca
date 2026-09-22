import assert from "node:assert/strict";
import test from "node:test";

import {
  canResumeCarouselAutoScroll,
  canWriteCarouselAutoScroll,
  shouldPauseCarouselAutoScroll,
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

test("carousel autoplay never writes during manual scrolling", () => {
  assert.equal(
    shouldPauseCarouselAutoScroll({
      currentScrollLeft: 140,
      expectedScrollLeft: 100,
    }),
    true,
  );
  assert.equal(
    canWriteCarouselAutoScroll({ paused: true }),
    false,
  );
  assert.equal(
    canWriteCarouselAutoScroll({ interactionActive: true }),
    false,
  );
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
