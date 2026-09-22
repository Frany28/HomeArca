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


test("About external navigation restores the correct endpoint before reverse entry", () => {
  const previousWindow = globalThis.window;

  try {
    globalThis.window = {
      matchMedia() {
        return { matches: false };
      },
    };

    const progress = {
      value: 0,
      get() {
        return this.value;
      },
      set(next) {
        this.value = next;
      },
    };

    const scroller = {
      clientHeight: 900,
      scrollTop: 2500,
      getBoundingClientRect() {
        return { top: 0 };
      },
      querySelector(selector) {
        if (selector !== "[data-about-story]") return null;

        return {
          getBoundingClientRect() {
            return {
              top: 2000 - scroller.scrollTop,
            };
          },
        };
      },
    };

    let settlementScheduled = 0;
    const controller = createAboutStoryController({
      coordination: {
        content: {
          synchronizeContentScroll() {},
        },
        input: {
          scheduleWheelGestureSettlement() {
            settlementScheduled += 1;
          },
        },
      },
      progress,
      reduceMotion: false,
      runtime: {
        wheelGestureState: {},
      },
      scroller,
    });

    assert.equal(controller.synchronizeForExternalNavigation(), true);
    assert.equal(progress.get(), 1);

    scroller.scrollTop = 2010;
    const event = {
      prevented: false,
      preventDefault() {
        this.prevented = true;
      },
      stopPropagation() {},
      timeStamp: 1,
    };

    assert.equal(
      controller.handleInput(event, -40, -1, { smooth: false }),
      true,
    );
    assert.equal(event.prevented, true);
    assert.ok(progress.get() < 1);
    assert.equal(settlementScheduled, 1);

    scroller.scrollTop = 1500;
    assert.equal(controller.synchronizeForExternalNavigation(), true);
    assert.equal(progress.get(), 0);

    controller.destroy();
  } finally {
    if (previousWindow === undefined) {
      Reflect.deleteProperty(globalThis, "window");
    } else {
      globalThis.window = previousWindow;
    }
  }
});

test("content navigation synchronizes About only after direct navigation or scrollbar jumps", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(
    new URL(
      "../src/pages/publicSite/home/hooks/homeScroll/createContentScrollController.js",
      import.meta.url,
    ),
    "utf8",
  );

  const directNavigationStart = source.indexOf("const navigateSection");
  const settleNativeStart = source.indexOf("const settleNativeScroll");
  const directNavigationSource = source.slice(
    directNavigationStart,
    settleNativeStart,
  );

  assert.match(
    directNavigationSource,
    /onComplete:[\s\S]*coordination\.about\?\.synchronizeForExternalNavigation\(\)/,
  );

  const scrollbarStart = source.indexOf("const endScrollbarDrag");
  const returnStart = source.indexOf("return {", scrollbarStart);
  const scrollbarSource = source.slice(scrollbarStart, returnStart);

  assert.match(
    scrollbarSource,
    /setContentMode\(true\);[\s\S]*coordination\.about\?\.synchronizeForExternalNavigation\(\);[\s\S]*synchronizeContentScroll\(\)/,
  );
});
