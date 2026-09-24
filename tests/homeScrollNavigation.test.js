import assert from "node:assert/strict";
import test from "node:test";

import {
  HOME_SCROLL_DIRECTIONS,
  HOME_SCROLL_PHASES,
  advanceFeaturedExpansionProgress,
  advanceHomeStatementProgress,
  advanceWheelGesture,
  createHomeScrollState,
  createScrollbarHomeScrollState,
  createWheelGestureState,
  getKeyboardDirection,
  getFeaturedExpansionTravelDistance,
  getHomeStatementTravelDistance,
  getHomeStatementTransform,
  getHomeStatementVisualState,
  getWheelGestureDeltaScale,
  getNearestPanelIndex,
  getNextHomeScrollState,
  getSequentialScrollbarPanelIndex,
  getSwipeDirection,
  limitHomeStatementWheelDelta,
  markWheelGestureIdle,
  normalizeWheelDelta,
} from "../src/pages/publicSite/home/utils/homeScrollNavigation.js";

const { UP, DOWN } = HOME_SCROLL_DIRECTIONS;
const { IMAGE, TITLE } = HOME_SCROLL_PHASES;

test("descending navigation alternates the next image and its title", () => {
  let state = createHomeScrollState();

  assert.deepEqual(state, { panelIndex: 0, phase: TITLE, entryDirection: null });

  state = getNextHomeScrollState(state, DOWN, 3);
  assert.deepEqual(state, { panelIndex: 1, phase: IMAGE, entryDirection: DOWN });

  state = getNextHomeScrollState(state, DOWN, 3);
  assert.deepEqual(state, { panelIndex: 1, phase: TITLE, entryDirection: null });

  state = getNextHomeScrollState(state, DOWN, 3);
  assert.deepEqual(state, { panelIndex: 2, phase: IMAGE, entryDirection: DOWN });

  state = getNextHomeScrollState(state, DOWN, 3);
  assert.deepEqual(state, { panelIndex: 2, phase: TITLE, entryDirection: null });

  assert.equal(getNextHomeScrollState(state, DOWN, 3), state);
});

test("ascending navigation uses the same image then title sequence", () => {
  let state = createHomeScrollState({ panelIndex: 2, phase: TITLE });

  state = getNextHomeScrollState(state, UP, 3);
  assert.deepEqual(state, { panelIndex: 1, phase: IMAGE, entryDirection: UP });

  state = getNextHomeScrollState(state, UP, 3);
  assert.deepEqual(state, { panelIndex: 1, phase: TITLE, entryDirection: null });

  state = getNextHomeScrollState(state, UP, 3);
  assert.deepEqual(state, { panelIndex: 0, phase: IMAGE, entryDirection: UP });

  state = getNextHomeScrollState(state, UP, 3);
  assert.deepEqual(state, { panelIndex: 0, phase: TITLE, entryDirection: null });

  assert.equal(getNextHomeScrollState(state, UP, 3), state);
});

test("a newly entered image must reveal its title before leaving in either direction", () => {
  const enteredDown = createHomeScrollState({
    panelIndex: 1,
    phase: IMAGE,
    entryDirection: DOWN,
  });
  const enteredUp = createHomeScrollState({
    panelIndex: 1,
    phase: IMAGE,
    entryDirection: UP,
  });

  assert.deepEqual(getNextHomeScrollState(enteredDown, UP, 3), {
    panelIndex: 1,
    phase: TITLE,
    entryDirection: null,
  });
  assert.deepEqual(getNextHomeScrollState(enteredUp, DOWN, 3), {
    panelIndex: 1,
    phase: TITLE,
    entryDirection: null,
  });
});

test("a settled scrollbar selection reveals its title immediately", () => {
  const state = createScrollbarHomeScrollState(1);

  assert.deepEqual(state, {
    panelIndex: 1,
    phase: TITLE,
    entryDirection: null,
  });
  assert.deepEqual(getNextHomeScrollState(state, DOWN, 3), {
    panelIndex: 2,
    phase: IMAGE,
    entryDirection: DOWN,
  });
  assert.deepEqual(getNextHomeScrollState(state, UP, 3), {
    panelIndex: 0,
    phase: IMAGE,
    entryDirection: UP,
  });
});

test("the fourth panel is entered as an image before its special effect", () => {
  const interiorTitle = createHomeScrollState({
    panelIndex: 2,
    phase: TITLE,
  });
  const statementImage = getNextHomeScrollState(interiorTitle, DOWN, 4);

  assert.deepEqual(statementImage, {
    panelIndex: 3,
    phase: IMAGE,
    entryDirection: DOWN,
  });
  assert.deepEqual(getNextHomeScrollState(statementImage, UP, 4), {
    panelIndex: 3,
    phase: TITLE,
    entryDirection: null,
  });
  assert.deepEqual(createScrollbarHomeScrollState(3), {
    panelIndex: 3,
    phase: TITLE,
    entryDirection: null,
  });
});

test("the statement can return to the previous panel after reversing its effect", () => {
  const statementStart = createHomeScrollState({
    panelIndex: 3,
    phase: IMAGE,
    entryDirection: DOWN,
  });

  assert.deepEqual(
    getNextHomeScrollState(statementStart, UP, 4, {
      skipCurrentImageReveal: true,
    }),
    {
      panelIndex: 2,
      phase: IMAGE,
      entryDirection: UP,
    },
  );
});

test("a scrollbar drag hides the title until the selection settles", () => {
  assert.deepEqual(createScrollbarHomeScrollState(1, { settled: false }), {
    panelIndex: 1,
    phase: IMAGE,
    entryDirection: null,
  });
});

test("wheel deltas normalize pixel, line and page units", () => {
  assert.deepEqual(
    normalizeWheelDelta({ deltaX: 2, deltaY: -4, deltaMode: 0 }, 800),
    { x: 2, y: -4 },
  );
  assert.deepEqual(
    normalizeWheelDelta({ deltaX: 1, deltaY: 3, deltaMode: 1 }, 800),
    { x: 16, y: 48 },
  );
  assert.deepEqual(
    normalizeWheelDelta({ deltaX: 0, deltaY: 1, deltaMode: 2 }, 800),
    { x: 0, y: 800 },
  );
});

test("trackpad bursts use a reduced scale without changing discrete mouse wheel input", () => {
  assert.equal(
    getWheelGestureDeltaScale({ deltaY: 4, deltaMode: 0 }),
    0.45,
  );
  assert.equal(
    getWheelGestureDeltaScale({ deltaY: 100, deltaMode: 0 }),
    1,
  );
  assert.equal(
    getWheelGestureDeltaScale({ deltaY: 3, deltaMode: 1 }),
    1,
  );
});

test("statement wheel deltas cap trackpad spikes without changing direction", () => {
  assert.equal(limitHomeStatementWheelDelta(18), 18);
  assert.equal(limitHomeStatementWheelDelta(120), 48);
  assert.equal(limitHomeStatementWheelDelta(-120), -48);
  assert.equal(limitHomeStatementWheelDelta(Number.NaN), 0);
});

test("a trackpad burst triggers one step and consumes its inertia", () => {
  let gesture = createWheelGestureState();

  gesture = advanceWheelGesture(gesture, 8);
  assert.equal(gesture.triggeredDirection, null);
  gesture = advanceWheelGesture(gesture, 10);
  assert.equal(gesture.triggeredDirection, null);
  gesture = advanceWheelGesture(gesture, 15);
  assert.equal(gesture.triggeredDirection, DOWN);

  gesture = advanceWheelGesture(gesture, 80);
  assert.equal(gesture.triggeredDirection, null);
  assert.equal(gesture.consumed, true);

  gesture = createWheelGestureState();
  gesture = advanceWheelGesture(gesture, -40);
  assert.equal(gesture.triggeredDirection, UP);
});

test("trackpad direction changes reset an incomplete accumulator", () => {
  let gesture = advanceWheelGesture(createWheelGestureState(), 20);

  gesture = advanceWheelGesture(gesture, -20);
  assert.equal(gesture.accumulator, -20);
  assert.equal(gesture.triggeredDirection, null);
});

test("September 4 calibration rearms after inertia decays", () => {
  let gesture = createWheelGestureState();

  gesture = advanceWheelGesture(gesture, 18, 32, 0);
  gesture = advanceWheelGesture(gesture, 18, 32, 20);
  assert.equal(gesture.triggeredDirection, DOWN);

  gesture = advanceWheelGesture(gesture, 12, 32, 70);
  gesture = advanceWheelGesture(gesture, 7, 32, 120);
  gesture = advanceWheelGesture(gesture, 3, 32, 190);
  assert.equal(gesture.triggeredDirection, null);

  gesture = advanceWheelGesture(gesture, 14, 32, 280);
  assert.equal(gesture.triggeredDirection, null);
  assert.equal(gesture.consumed, false);

  gesture = advanceWheelGesture(gesture, 20, 32, 300);
  assert.equal(gesture.triggeredDirection, DOWN);
});

test("September 4 calibration does not rearm on undecayed inertia", () => {
  let gesture = advanceWheelGesture(createWheelGestureState(), 40, 32, 0);

  gesture = advanceWheelGesture(gesture, 18, 32, 250);
  gesture = advanceWheelGesture(gesture, 14, 32, 300);
  gesture = advanceWheelGesture(gesture, 11, 32, 350);

  assert.equal(gesture.triggeredDirection, null);
  assert.equal(gesture.consumed, true);
});

test("September 4 opposite-direction gesture respects the lock window", () => {
  let gesture = advanceWheelGesture(createWheelGestureState(), 40, 32, 0);

  gesture = advanceWheelGesture(gesture, -14, 32, 240);
  assert.equal(gesture.consumed, false);
  assert.equal(gesture.triggeredDirection, null);

  gesture = advanceWheelGesture(gesture, -20, 32, 260);
  assert.equal(gesture.triggeredDirection, UP);
});

test("one complete trackpad curve keeps a single discrete intention", () => {
  let gesture = createWheelGestureState();
  const triggers = [];

  [3, 6, 12, 24, 31, 26, 18, 11, 6, 3, 1].forEach((deltaY, index) => {
    gesture = advanceWheelGesture(gesture, deltaY, 32, index * 16);
    if (gesture.triggeredDirection !== null) {
      triggers.push(gesture.triggeredDirection);
    }
  });

  assert.deepEqual(triggers, [DOWN]);
});

test("realistic smooth trackpad curve produces one intention", () => {
  let gesture = createWheelGestureState();
  const triggers = [];

  [2, 5, 11, 20, 34, 25, 16, 9, 4, 2].forEach((deltaY, index) => {
    gesture = advanceWheelGesture(gesture, deltaY, 32, index * 16);
    if (gesture.triggeredDirection !== null) {
      triggers.push(gesture.triggeredDirection);
    }
  });

  assert.deepEqual(triggers, [DOWN]);
});

test("short residual inertia stays part of the same physical gesture", () => {
  let gesture = createWheelGestureState();
  const triggers = [];
  let eventTime = 0;

  [30, 22, 14, 8, 4, 2].forEach((deltaY) => {
    gesture = advanceWheelGesture(gesture, deltaY, 32, eventTime += 16);
    if (gesture.triggeredDirection !== null) {
      triggers.push(gesture.triggeredDirection);
    }
  });

  eventTime += 96;

  [7, 15, 26].forEach((deltaY) => {
    gesture = advanceWheelGesture(gesture, deltaY, 32, eventTime += 16);
    if (gesture.triggeredDirection !== null) {
      triggers.push(gesture.triggeredDirection);
    }
  });

  assert.deepEqual(triggers, [DOWN]);
});

test("idle resets the wheel state completely like the September 4 implementation", () => {
  let gesture = advanceWheelGesture(createWheelGestureState(), 40, 32, 0);

  assert.equal(gesture.consumed, true);
  gesture = markWheelGestureIdle(gesture);

  assert.deepEqual(gesture, createWheelGestureState());
});

test("a fresh gesture responds immediately after genuine idle", () => {
  let gesture = advanceWheelGesture(createWheelGestureState(), 100, 32, 0);
  assert.equal(gesture.triggeredDirection, DOWN);

  gesture = markWheelGestureIdle(gesture);
  gesture = advanceWheelGesture(gesture, 100, 32, 300);

  assert.equal(gesture.triggeredDirection, DOWN);
});

test("a small opposite-direction correction does not create another intention", () => {
  let gesture = createWheelGestureState();
  const triggers = [];

  [6, 14, 25, 18, -2, 10, 5, 2].forEach((deltaY, index) => {
    gesture = advanceWheelGesture(gesture, deltaY, 32, index * 16);
    if (gesture.triggeredDirection !== null) {
      triggers.push(gesture.triggeredDirection);
    }
  });

  assert.deepEqual(triggers, [DOWN]);
});

test("touch gestures require distance and vertical dominance", () => {
  assert.equal(
    getSwipeDirection({ startX: 100, startY: 160, endX: 105, endY: 90 }),
    DOWN,
  );
  assert.equal(
    getSwipeDirection({ startX: 100, startY: 90, endX: 95, endY: 160 }),
    UP,
  );
  assert.equal(
    getSwipeDirection({ startX: 100, startY: 100, endX: 102, endY: 70 }),
    null,
  );
  assert.equal(
    getSwipeDirection({ startX: 100, startY: 100, endX: 170, endY: 45 }),
    null,
  );
});

test("keyboard controls map to the shared navigation directions", () => {
  assert.equal(getKeyboardDirection({ key: "ArrowDown" }), DOWN);
  assert.equal(getKeyboardDirection({ key: "PageDown" }), DOWN);
  assert.equal(getKeyboardDirection({ key: " " }), DOWN);
  assert.equal(getKeyboardDirection({ key: "ArrowUp" }), UP);
  assert.equal(getKeyboardDirection({ key: "PageUp" }), UP);
  assert.equal(getKeyboardDirection({ key: " ", shiftKey: true }), UP);
  assert.equal(getKeyboardDirection({ key: "Enter" }), null);
});

test("scrollbar alignment selects the closest panel", () => {
  const offsets = [0, 800, 1600];

  assert.equal(getNearestPanelIndex(0, offsets), 0);
  assert.equal(getNearestPanelIndex(620, offsets), 1);
  assert.equal(getNearestPanelIndex(1500, offsets), 2);
  assert.equal(getNearestPanelIndex(900, offsets), 1);
});

test("scrollbar dragging advances at most one panel so every title is shown", () => {
  assert.equal(getSequentialScrollbarPanelIndex(0, 3, 4), 1);
  assert.equal(getSequentialScrollbarPanelIndex(1, 3, 4), 2);
  assert.equal(getSequentialScrollbarPanelIndex(3, 0, 4), 2);
  assert.equal(getSequentialScrollbarPanelIndex(2, 2, 4), 2);
});

test("statement progress follows scroll deltas and reverses from any point", () => {
  const downProgress = advanceHomeStatementProgress(0, 100, 1000);
  const reversedProgress = advanceHomeStatementProgress(
    downProgress,
    -50,
    1000,
  );

  assert.equal(downProgress, 2 / 17);
  assert.equal(reversedProgress, 1 / 17);
  assert.equal(advanceHomeStatementProgress(0.9, 100, 1000), 1);
  assert.equal(advanceHomeStatementProgress(0.1, -100, 1000), 0);
});

test("statement travel distance stays fast and responsive", () => {
  assert.equal(getHomeStatementTravelDistance(400), 650);
  assert.equal(getHomeStatementTravelDistance(900), 765);
  assert.equal(getHomeStatementTravelDistance(1400), 900);
});

test("reduced motion keeps statement endpoints without intermediate zoom", () => {
  assert.equal(advanceHomeStatementProgress(0.4, 1, 900, true), 1);
  assert.equal(advanceHomeStatementProgress(0.6, -1, 900, true), 0);
});

test("statement visual state scales the complete phrase from its final geometry", () => {
  assert.deepEqual(getHomeStatementVisualState(0), {
    progress: 0,
    maskScale: 180,
  });
  assert.deepEqual(getHomeStatementVisualState(1), {
    progress: 1,
    maskScale: 1,
  });
  const midpoint = getHomeStatementVisualState(0.5);
  assert.equal(midpoint.progress, 0.5);
  assert.ok(Math.abs(midpoint.maskScale - Math.sqrt(180)) < Number.EPSILON * 180);
});

test("statement transform keeps the C anchor fixed for the complete scrub", () => {
  const anchorX = 641.25;
  const anchorY = 357.75;

  for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
    const { scale, translateX, translateY } = getHomeStatementTransform(
      progress,
      anchorX,
      anchorY,
    );
    const transformedX = anchorX * scale + translateX;
    const transformedY = anchorY * scale + translateY;

    assert.ok(Math.abs(transformedX - anchorX) < 0.5);
    assert.ok(Math.abs(transformedY - anchorY) < 0.5);
  }
});

test("featured image expansion follows wheel distance and reverses exactly", () => {
  assert.equal(getFeaturedExpansionTravelDistance(800), 800);
  assert.equal(getFeaturedExpansionTravelDistance(300), 420);
  assert.equal(getFeaturedExpansionTravelDistance(1400), 1400);

  const partial = advanceFeaturedExpansionProgress(0, 160, 800);
  assert.equal(partial, 0.2);
  assert.equal(
    advanceFeaturedExpansionProgress(partial, -80, 800),
    0.1,
  );
  assert.equal(
    advanceFeaturedExpansionProgress(partial, 1000, 800),
    1,
  );
  assert.equal(
    advanceFeaturedExpansionProgress(partial, -1000, 800),
    0,
  );
});
