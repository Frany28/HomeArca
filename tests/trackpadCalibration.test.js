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

const { DOWN, UP } = HOME_SCROLL_DIRECTIONS;

test("same-direction trackpad inertia cannot become a second navigation intention", () => {
  let gesture = createWheelGestureState();
  const triggers = [];

  [40, 18, 10, 6, 12, 20, 10, 4].forEach((deltaY, index) => {
    gesture = advanceWheelGesture(
      gesture,
      deltaY,
      32,
      index * 32,
      { allowSameDirectionRearm: false },
    );

    if (gesture.triggeredDirection !== null) {
      triggers.push(gesture.triggeredDirection);
    }
  });

  assert.deepEqual(triggers, [DOWN]);
});

test("a genuinely idle trackpad gesture can navigate again in the same direction", () => {
  let gesture = advanceWheelGesture(
    createWheelGestureState(),
    40,
    32,
    0,
    { allowSameDirectionRearm: false },
  );

  gesture = markWheelGestureIdle(gesture);

  const triggers = [];

  [8, 12, 20].forEach((deltaY, index) => {
    gesture = advanceWheelGesture(
      gesture,
      deltaY,
      32,
      240 + index * 16,
      { allowSameDirectionRearm: false },
    );

    if (gesture.triggeredDirection !== null) {
      triggers.push(gesture.triggeredDirection);
    }
  });

  assert.deepEqual(triggers, [DOWN]);
});

test("an intentional opposite trackpad gesture remains responsive", () => {
  let gesture = advanceWheelGesture(
    createWheelGestureState(),
    40,
    32,
    0,
    { allowSameDirectionRearm: false },
  );
  const triggers = [gesture.triggeredDirection];

  [-14, -20].forEach((deltaY, index) => {
    gesture = advanceWheelGesture(
      gesture,
      deltaY,
      32,
      64 + index * 16,
      { allowSameDirectionRearm: false },
    );

    if (gesture.triggeredDirection !== null) {
      triggers.push(gesture.triggeredDirection);
    }
  });

  assert.deepEqual(triggers, [DOWN, UP]);
});

test("wheel navigation separates raw intent from smoothed visual progress", () => {
  assert.match(
    inputGestureSource,
    /const wheelIntentDelta = normalizedDelta\.y;/,
  );
  assert.match(
    inputGestureSource,
    /handleBoundaryWheel\(\s*event,\s*wheelIntentDelta,\s*direction,/,
  );
  assert.match(
    inputGestureSource,
    /wheelIntentDelta,\s*WHEEL_GESTURE_THRESHOLD_PX,\s*event\.timeStamp,\s*\{\s*allowSameDirectionRearm: false,/,
  );
  assert.match(
    featuredControllerSource,
    /direction \* intentMagnitude,\s*WHEEL_GESTURE_THRESHOLD_PX,\s*event\.timeStamp,\s*\{\s*allowSameDirectionRearm: false,/,
  );
});
