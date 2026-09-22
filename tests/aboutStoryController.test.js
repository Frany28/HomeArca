import assert from "node:assert/strict";
import test from "node:test";

import { createAboutStoryController } from "../src/pages/publicSite/home/hooks/homeScroll/createAboutStoryController.js";

test("About story controller is safe when window is unavailable", () => {
  const previousWindow = globalThis.window;

  try {
    Reflect.deleteProperty(globalThis, "window");

    const progress = {
      value: 0,
      get() {
        return this.value;
      },
      set(next) {
        this.value = next;
      },
    };

    const controller = createAboutStoryController({
      coordination: {
        content: {
          synchronizeContentScroll() {},
        },
        input: {
          scheduleWheelGestureSettlement() {},
        },
      },
      progress,
      reduceMotion: false,
      runtime: {
        wheelGestureState: {},
      },
      scroller: {
        clientHeight: 900,
        scrollTop: 0,
        querySelector() {
          return null;
        },
      },
    });

    assert.equal(
      controller.handleInput(
        {
          preventDefault() {},
          stopPropagation() {},
          timeStamp: 0,
        },
        100,
        1,
      ),
      false,
    );

    controller.destroy();
  } finally {
    if (previousWindow === undefined) {
      Reflect.deleteProperty(globalThis, "window");
    } else {
      globalThis.window = previousWindow;
    }
  }
});

test("About responsive story remains static through 1024px", () => {
  const previousWindow = globalThis.window;
  let queryCount = 0;

  try {
    globalThis.window = {
      matchMedia(query) {
        return {
          matches: query === "(max-width: 1024px)",
        };
      },
    };

    const progress = {
      get: () => 0,
      set() {},
    };

    const controller = createAboutStoryController({
      coordination: {
        content: {
          synchronizeContentScroll() {},
        },
        input: {
          scheduleWheelGestureSettlement() {},
        },
      },
      progress,
      reduceMotion: false,
      runtime: {
        wheelGestureState: {},
      },
      scroller: {
        clientHeight: 900,
        scrollTop: 0,
        querySelector() {
          queryCount += 1;
          return null;
        },
      },
    });

    assert.equal(
      controller.handleInput(
        {
          preventDefault() {},
          stopPropagation() {},
          timeStamp: 0,
        },
        100,
        1,
      ),
      false,
    );
    assert.equal(queryCount, 0);

    controller.destroy();
  } finally {
    if (previousWindow === undefined) {
      Reflect.deleteProperty(globalThis, "window");
    } else {
      globalThis.window = previousWindow;
    }
  }
});
