import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  HOME_SCROLL_DIRECTIONS,
  advanceWheelGesture,
  createWheelGestureState,
  markWheelGestureIdle,
} from "../src/pages/publicSite/home/utils/homeScrollNavigation.js";

const inputGestureSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/hooks/homeScroll/createInputGestureController.js",
    import.meta.url,
  ),
  "utf8",
);

const { DOWN, UP } = HOME_SCROLL_DIRECTIONS;

test("September 4 constants still define the calibrated gesture behavior", () => {
  const source = readFileSync(
    new URL(
      "../src/pages/publicSite/home/utils/homeScrollNavigation.js",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /WHEEL_REARM_MIN_DELAY_MS = 220/);
  assert.match(source, /WHEEL_DECAY_MAGNITUDE_PX = 6/);
  assert.match(source, /WHEEL_NEW_IMPULSE_MAGNITUDE_PX = 10/);
  assert.match(source, /WHEEL_NEW_IMPULSE_RATIO = 1\.8/);
});

test("idle produces a completely fresh physical gesture", () => {
  let gesture = advanceWheelGesture(
    createWheelGestureState(),
    40,
    32,
    0,
  );

  assert.equal(gesture.consumed, true);

  gesture = markWheelGestureIdle(gesture);

  assert.deepEqual(gesture, createWheelGestureState());
});

test("one full trackpad curve cannot consume two navigation phases", () => {
  let gesture = createWheelGestureState();
  const triggers = [];

  [3, 8, 18, 31, 24, 14, 7, 3, 2, 6, 12, 20, 10, 4, 2]
    .forEach((deltaY, index) => {
      gesture = advanceWheelGesture(
        gesture,
        deltaY,
        32,
        index * 16,
      );

      if (gesture.triggeredDirection !== null) {
        triggers.push(gesture.triggeredDirection);
      }
    });

  assert.deepEqual(triggers, [DOWN]);
});

test("a genuine new impulse after decay can navigate again", () => {
  let gesture = createWheelGestureState();
  const triggers = [];

  [
    [18, 0],
    [18, 20],
    [12, 70],
    [7, 120],
    [3, 190],
    [14, 280],
    [20, 300],
  ].forEach(([deltaY, eventTime]) => {
    gesture = advanceWheelGesture(
      gesture,
      deltaY,
      32,
      eventTime,
    );

    if (gesture.triggeredDirection !== null) {
      triggers.push(gesture.triggeredDirection);
    }
  });

  assert.deepEqual(triggers, [DOWN, DOWN]);
});

test("opposite direction waits for the calibrated lock window", () => {
  let gesture = advanceWheelGesture(
    createWheelGestureState(),
    40,
    32,
    0,
  );

  gesture = advanceWheelGesture(gesture, -14, 32, 240);
  assert.equal(gesture.consumed, false);
  assert.equal(gesture.triggeredDirection, null);

  gesture = advanceWheelGesture(gesture, -20, 32, 260);
  assert.equal(gesture.triggeredDirection, UP);
});

test("controller keeps raw wheel intent separate from visual smoothing", () => {
  assert.match(
    inputGestureSource,
    /const wheelIntentDelta = normalizedDelta\.y;/,
  );
  assert.match(
    inputGestureSource,
    /progressDelta = \{[\s\S]*runtime\.wheelGestureDeltaScale/,
  );
  assert.match(
    inputGestureSource,
    /advanceWheelGesture\(\s*runtime\.wheelGestureState,\s*wheelIntentDelta,/,
  );
});

test("wheel events are still observed while transitions are active", () => {
  assert.doesNotMatch(
    inputGestureSource,
    /observeConsumedWheelGesture = \([^)]*\) => \{\s*if \(!runtime\.wheelGestureState\.consumed\) return;/,
  );
  assert.match(
    inputGestureSource,
    /runtime\.activeTween \|\| runtime\.isProgrammaticScroll[\s\S]*observeConsumedWheelGesture\(/,
  );
});
