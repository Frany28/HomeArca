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

const featuredControllerSource = readFileSync(
  new URL(
    "../src/pages/publicSite/home/hooks/homeScroll/createFeaturedProjectsController.js",
    import.meta.url,
  ),
  "utf8",
);

const { DOWN } = HOME_SCROLL_DIRECTIONS;

test("one physical trackpad curve still produces one navigation intention", () => {
  let gesture = createWheelGestureState();
  const triggers = [];

  [3, 6, 12, 24, 31, 26, 18, 11, 6, 3, 1].forEach((deltaY, index) => {
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

test("a fresh trackpad impulse can rearm after the previous curve has decayed", () => {
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

test("a mouse wheel pulse works again after a genuine idle", () => {
  let gesture = advanceWheelGesture(
    createWheelGestureState(),
    100,
    32,
    0,
  );

  assert.equal(gesture.triggeredDirection, DOWN);

  gesture = markWheelGestureIdle(gesture);
  gesture = advanceWheelGesture(
    gesture,
    100,
    32,
    300,
  );

  assert.equal(gesture.triggeredDirection, DOWN);
});

test("controllers keep raw intent calibration without disabling natural rearming", () => {
  assert.match(
    inputGestureSource,
    /const wheelIntentDelta = normalizedDelta\.y;/,
  );
  assert.match(
    inputGestureSource,
    /handleBoundaryWheel\(\s*event,\s*wheelIntentDelta,\s*direction,/,
  );
  assert.doesNotMatch(
    inputGestureSource,
    /allowSameDirectionRearm:\s*false/,
  );
  assert.doesNotMatch(
    featuredControllerSource,
    /allowSameDirectionRearm:\s*false/,
  );
});
