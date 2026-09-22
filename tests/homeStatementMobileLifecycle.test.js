import assert from "node:assert/strict";
import test from "node:test";

import {
  HOME_SCROLL_PHASES,
} from "../src/pages/publicSite/home/utils/homeScrollNavigation.js";
import {
  VIEWPORT_RESIZE_KINDS,
} from "../src/pages/publicSite/home/utils/viewportResize.js";
import {
  createStatementGeometryRefreshQueue,
  isStatementGeometrySettled,
  shouldDeferStatementGeometryResize,
} from "../src/pages/publicSite/home/utils/statementGeometry.js";
import {
  createHomeStatementController,
} from "../src/pages/publicSite/home/hooks/homeScroll/createHomeStatementController.js";
import {
  isContentNavigationReady,
} from "../src/pages/publicSite/home/hooks/homeScroll/createContentScrollController.js";

function createProgress(initialValue) {
  let value = initialValue;
  return {
    get: () => value,
    set: (nextValue) => { value = nextValue; },
  };
}

function createStatementRevealHarness() {
  const frames = [];
  const tweens = [];
  const progress = createProgress(1);
  let navigationState = {
    panelIndex: 3,
    phase: HOME_SCROLL_PHASES.IMAGE,
    entryDirection: 1,
  };
  let completed = false;
  const controller = createHomeStatementController({
    animation: {
      to(target, options) {
        tweens.push({ target, options });
        return { kill() {} };
      },
    },
    cancelFrame() {},
    commitNavigationState(nextState) { navigationState = nextState; },
    getNavigationState: () => navigationState,
    getViewportHeight: () => 800,
    isPanelTransitioning: () => false,
    panelIndex: 3,
    progress,
    reduceMotion: false,
    requestFrame(callback) {
      frames.push(callback);
      return frames.length;
    },
  });

  return {
    controller,
    frames,
    getCompleted: () => completed,
    getNavigationState: () => navigationState,
    progress,
    startAutoReveal: () => controller.startAutoReveal(() => { completed = true; }),
    tweens,
  };
}

test("mobile statement enters EFFECT explicitly at progress zero", () => {
  const harness = createStatementRevealHarness();

  harness.startAutoReveal();

  assert.equal(harness.progress.get(), 0);
  assert.equal(harness.getNavigationState().phase, HOME_SCROLL_PHASES.EFFECT);
  assert.equal(harness.tweens.length, 0);
});

test("mobile statement paints progress zero before autoplay advances to one", () => {
  const {
    frames,
    getCompleted,
    getNavigationState,
    progress,
    startAutoReveal,
    tweens,
  } = createStatementRevealHarness();

  startAutoReveal();

  assert.equal(progress.get(), 0);
  assert.equal(getNavigationState().phase, HOME_SCROLL_PHASES.EFFECT);
  assert.equal(tweens.length, 0);
  assert.equal(frames.length, 1);

  frames.shift()();
  assert.equal(tweens.length, 0);
  assert.equal(frames.length, 1);

  frames.shift()();
  assert.equal(tweens.length, 1);

  const [{ target, options }] = tweens;
  target.value = 0.5;
  options.onUpdate();
  assert.equal(progress.get(), 0.5);
  assert.equal(getNavigationState().phase, HOME_SCROLL_PHASES.EFFECT);

  target.value = 1;
  options.onUpdate();
  options.onComplete();

  assert.equal(progress.get(), 1);
  assert.equal(getNavigationState().phase, HOME_SCROLL_PHASES.TITLE);
  assert.equal(getCompleted(), true);
});

test("statement cannot open Services before progress reaches one", () => {
  assert.equal(
    isContentNavigationReady({
      contentMode: false,
      currentState: { panelIndex: 3, phase: HOME_SCROLL_PHASES.EFFECT },
      statementProgress: 0.99,
      titleRevealLocked: false,
    }),
    false,
  );
  assert.equal(
    isContentNavigationReady({
      contentMode: false,
      currentState: { panelIndex: 3, phase: HOME_SCROLL_PHASES.TITLE },
      statementProgress: 1,
      titleRevealLocked: false,
    }),
    true,
  );
});

test("transient viewport resize is deferred while statement geometry animates", () => {
  assert.equal(
    shouldDeferStatementGeometryResize(
      VIEWPORT_RESIZE_KINDS.TRANSIENT_MOBILE_HEIGHT,
    ),
    true,
  );
  assert.equal(
    isStatementGeometrySettled({
      effectStarted: true,
      progress: 0.5,
    }),
    false,
  );
});

test("pending statement geometry refresh runs once after animation settles", () => {
  const frames = [];
  const timers = [];
  let measured = 0;
  let settled = false;
  const queue = createStatementGeometryRefreshQueue({
    cancelFrame() {},
    clearTimer() {},
    measure() {
      measured += 1;
      queue.complete();
    },
    requestFrame(callback) {
      frames.push(callback);
      return frames.length;
    },
    setTimer(callback) {
      timers.push(callback);
      return timers.length;
    },
  });

  queue.defer(() => settled);
  queue.defer(() => settled);
  timers.at(-1)();
  assert.equal(measured, 0);

  settled = true;
  queue.flushIfSettled(() => settled);
  assert.equal(frames.length, 1);
  frames.shift()();
  assert.equal(measured, 1);

  queue.flushIfSettled(() => settled);
  assert.equal(frames.length, 0);
});
