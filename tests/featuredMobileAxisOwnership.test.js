import assert from "node:assert/strict";
import test from "node:test";

import {
  canResumeCarouselAutoScroll,
  canWriteCarouselAutoScroll,
  shouldPauseCarouselAutoScroll,
} from "../src/pages/publicSite/featuredProjects/utils/carouselAutoScroll.js";
import {
  FEATURED_TOUCH_AXES,
  advanceControlledFeaturedTouchGesture,
  canControlFeaturedTouchGesture,
  createControlledFeaturedTouchGesture,
} from "../src/pages/publicSite/home/utils/featuredTouchGesture.js";
import {
  clearTouchGestureForPointer,
} from "../src/pages/publicSite/home/utils/touchGestureOwnership.js";

function createGesture(overrides = {}) {
  return createControlledFeaturedTouchGesture({
    bounds: { start: 400, end: 900 },
    nativeHorizontalTarget: false,
    pointerId: 7,
    startScrollTop: 650,
    startX: 100,
    startY: 300,
    ...overrides,
  });
}

test("Featured mobile clamps vertical movement to the current project boundary", () => {
  const update = advanceControlledFeaturedTouchGesture(
    createGesture(),
    { clientX: 100, clientY: -200 },
  );

  assert.equal(update.ownsVertical, true);
  assert.equal(update.scrollTop, 900);
  assert.equal(update.transitionDirection, 1);
});

test("reaching a Featured boundary does not skip its transition threshold", () => {
  const gesture = createControlledFeaturedTouchGesture({
    bounds: { start: 400, end: 900 },
    pointerId: 7,
    startScrollTop: 500,
    startX: 30,
    startY: 600,
  });

  const atBoundary = advanceControlledFeaturedTouchGesture(gesture, {
    clientX: 30,
    clientY: 200,
    transitionThreshold: 48,
  });

  assert.equal(atBoundary.scrollTop, 900);
  assert.equal(atBoundary.transitionDirection, null);
  assert.equal(atBoundary.gesture.consumed, false);

  const deliberateOvershoot = advanceControlledFeaturedTouchGesture(
    atBoundary.gesture,
    {
      clientX: 30,
      clientY: 152,
      transitionThreshold: 48,
    },
  );

  assert.equal(deliberateOvershoot.scrollTop, 900);
  assert.equal(deliberateOvershoot.transitionDirection, 1);
  assert.equal(deliberateOvershoot.gesture.consumed, true);
});

test("one vertical gesture can request at most one project transition", () => {
  const firstUpdate = advanceControlledFeaturedTouchGesture(
    createGesture(),
    { clientX: 100, clientY: -200 },
  );
  const secondUpdate = advanceControlledFeaturedTouchGesture(
    firstUpdate.gesture,
    { clientX: 100, clientY: -400 },
  );

  assert.equal(firstUpdate.transitionDirection, 1);
  assert.equal(secondUpdate.transitionDirection, null);
  assert.equal(secondUpdate.gesture.consumed, true);
});

test("Featured cannot take scrollTop ownership while a panel transition is active", () => {
  assert.equal(
    canControlFeaturedTouchGesture({ activeTween: true }),
    false,
  );
  assert.equal(
    canControlFeaturedTouchGesture({ isProgrammaticScroll: true }),
    false,
  );
  assert.equal(
    canControlFeaturedTouchGesture({}),
    true,
  );
});

test("reverse Featured navigation also stops at one project per gesture", () => {
  const gesture = createGesture({ startScrollTop: 650 });
  const firstUpdate = advanceControlledFeaturedTouchGesture(
    gesture,
    { clientX: 100, clientY: 700 },
  );
  const secondUpdate = advanceControlledFeaturedTouchGesture(
    firstUpdate.gesture,
    { clientX: 100, clientY: 900 },
  );

  assert.equal(firstUpdate.scrollTop, 400);
  assert.equal(firstUpdate.transitionDirection, -1);
  assert.equal(secondUpdate.transitionDirection, null);
});

test("horizontal movement over the carousel stays browser-owned", () => {
  const update = advanceControlledFeaturedTouchGesture(
    createGesture({ nativeHorizontalTarget: true }),
    { clientX: 190, clientY: 295 },
  );

  assert.equal(update.gesture.axis, FEATURED_TOUCH_AXES.HORIZONTAL);
  assert.equal(update.ownsVertical, false);
  assert.equal(update.scrollTop, null);
  assert.equal(update.transitionDirection, null);
});

test("vertical movement beginning over the carousel is still Home-owned", () => {
  const update = advanceControlledFeaturedTouchGesture(
    createGesture({ nativeHorizontalTarget: true }),
    { clientX: 105, clientY: 180 },
  );

  assert.equal(update.gesture.axis, FEATURED_TOUCH_AXES.VERTICAL);
  assert.equal(update.ownsVertical, true);
  assert.equal(update.scrollTop, 770);
});

test("pointer cancellation clears only the matching gesture", () => {
  const gesture = createGesture();

  assert.equal(clearTouchGestureForPointer(gesture, 7), null);
  assert.equal(clearTouchGestureForPointer(gesture, 8), gesture);
});

test("carousel autoplay never writes during manual horizontal scrolling", () => {
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
