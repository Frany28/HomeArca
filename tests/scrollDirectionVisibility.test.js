import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../src/hooks/useScrollDirectionVisibility.js", import.meta.url),
  "utf8",
);

function createHarness({ reducedMotion = false } = {}) {
  const effects = [];
  const triggers = [];
  const calls = [];
  const animation = {
    progress() { return this; },
    play() { calls.push("show"); },
    reverse() { calls.push("hide"); },
  };
  const listeners = {};
  const targetListeners = {};
  const target = { addEventListener(type, fn) { targetListeners[type] = fn; }, removeEventListener(type) { delete targetListeners[type]; }, contains(node) { return node === this; } };
  const window = {
    getComputedStyle: () => ({ overflowY: "hidden" }),
    addEventListener(type, handler) { listeners[type] = handler; },
    removeEventListener(type) { delete listeners[type]; },
  };
  const document = { body: {} };
  const gsap = {
    registerPlugin() {},
    set() { calls.push("reset"); },
    from() { return animation; },
    context(callback) {
      callback();
      return { revert() { calls.push("cleanup"); } };
    },
  };
  const ScrollTrigger = { create(options) { triggers.push(options); } };
  const loadHook = new Function(
    "useEffect", "useLayoutEffect", "gsap", "ScrollTrigger",
    "useReducedMotion", "window", "document",
    source.replace(/^import .*;\r?\n/gm, "")
      .replace(/export \{[\s\S]*?\};/, "")
      .replace("export default useScrollDirectionVisibility;", "return useScrollDirectionVisibility;"),
  );
  const hook = loadHook(
    (effect) => effects.push(effect),
    (effect) => effect(),
    gsap, ScrollTrigger, () => reducedMotion, window, document,
  );
  return { calls, effects, hook, triggers, window, listeners, target, targetListeners };
}

test("navbar waits for the ancestor ref and follows Home's own scroll in both directions", () => {
  const harness = createHarness();
  const scrollContainerRef = { current: null };
  harness.hook({ current: harness.target }, { scrollContainerRef });
  assert.equal(harness.triggers.length, 0);

  // La ref del ancestro se asigna después de los efectos de layout del hijo.
  const homeScroller = { addEventListener() {}, removeEventListener() {} };
  scrollContainerRef.current = homeScroller;
  const cleanup = harness.effects[0]();
  const trigger = harness.triggers[0];
  assert.equal(trigger.scroller, homeScroller);
  assert.equal(trigger.start, 0);
  assert.equal(trigger.end, "max");
  trigger.onUpdate({ scroll: () => 500, direction: 1 });
  trigger.onUpdate({ scroll: () => 450, direction: -1 });
  trigger.onUpdate({ scroll: () => 0, direction: 1 });
  cleanup();
  assert.deepEqual(harness.calls, ["hide", "show", "show", "cleanup"]);
});

test("navbar preserves window scrolling when there is no nested scroller", () => {
  const harness = createHarness();
  harness.hook({ current: harness.target });
  harness.effects[0]();
  assert.equal(harness.triggers[0].scroller, undefined);
});

test("reduced motion keeps the navbar visible without a scroll animation", () => {
  const harness = createHarness({ reducedMotion: true });
  harness.hook({ current: harness.target });
  harness.effects[0]();
  assert.equal(harness.triggers.length, 0);
  assert.deepEqual(harness.calls, ["reset"]);
});

test("an upward wheel gesture reveals immediately and overrides an ongoing downward tween", () => {
  const harness = createHarness();
  harness.hook({ current: harness.target });
  const cleanup = harness.effects[0]();
  const update = harness.triggers[0].onUpdate;
  update({ scroll: () => 500, direction: 1 });
  harness.listeners.wheel({ deltaY: -1, deltaX: 0 });
  assert.deepEqual(harness.calls, ["hide", "show"]);
  update({ scroll: () => 550, direction: 1 });
  assert.equal(harness.calls.at(-1), "show");
  harness.listeners.wheel({ deltaY: 1, deltaX: 0 });
  update({ scroll: () => 600, direction: 1 });
  assert.equal(harness.calls.at(-1), "hide");
  cleanup();
  assert.deepEqual(harness.listeners, {});
});

test("touch and keyboard reveal without waiting for actual scroll", () => {
  const harness = createHarness();
  harness.hook({ current: harness.target });
  harness.effects[0]();
  harness.listeners.pointerdown({ pointerType: "touch", isPrimary: true, pointerId: 1, clientX: 10, clientY: 10 });
  harness.listeners.pointermove({ pointerId: 1, clientX: 10, clientY: 11 });
  harness.listeners.keydown({ key: "ArrowUp" });
  assert.deepEqual(harness.calls, ["show", "show"]);
});

test("horizontal gestures and pinch zoom do not reveal the navbar", () => {
  const harness = createHarness();
  harness.hook({ current: harness.target });
  harness.effects[0]();
  harness.listeners.wheel({ deltaX: 30, deltaY: -1 });
  harness.listeners.wheel({ deltaX: 0, deltaY: -30, ctrlKey: true });
  assert.deepEqual(harness.calls, []);
});

test("consumed category gestures hide and show the navbar without moving scrollTop", () => {
  const harness = createHarness();
  harness.hook({ current: harness.target });
  harness.effects[0]();
  harness.listeners.wheel({ deltaX: 0, deltaY: 60 });
  assert.equal(harness.calls.at(-1), "hide");
  harness.listeners.wheel({ deltaX: 0, deltaY: -60 });
  assert.equal(harness.calls.at(-1), "show");
});

test("native scrolling still animates beyond the initially measured GSAP range", () => {
  const harness = createHarness();
  harness.hook({ current: harness.target });
  const cleanup = harness.effects[0]();
  harness.window.scrollY = 5000;
  harness.listeners.scroll();
  assert.equal(harness.calls.at(-1), "hide");
  harness.window.scrollY = 4900;
  harness.listeners.scroll();
  assert.equal(harness.calls.at(-1), "show");
  cleanup();
  assert.deepEqual(harness.listeners, {});
});

test("clicking a navbar destination does not pin the navbar visible during later scrolling", () => {
  const harness = createHarness();
  harness.hook({ current: harness.target });
  harness.effects[0]();
  harness.listeners.pointerdown({ pointerType: "mouse" });
  harness.targetListeners.focusin();
  harness.targetListeners.focusout({ relatedTarget: harness.target });
  harness.listeners.wheel({ deltaX: 0, deltaY: 60 });
  assert.equal(harness.calls.at(-1), "hide");
});

test("keyboard focus reveals the navbar and prevents it from hiding until focus leaves", () => {
  const harness = createHarness();
  harness.hook({ current: harness.target });
  const cleanup = harness.effects[0]();
  const update = harness.triggers[0].onUpdate;
  update({ scroll: () => 500, direction: 1 });
  harness.targetListeners.focusin();
  update({ scroll: () => 550, direction: 1 });
  assert.equal(harness.calls.at(-1), "show");
  harness.targetListeners.focusout({ relatedTarget: harness.target });
  update({ scroll: () => 600, direction: 1 });
  assert.equal(harness.calls.at(-1), "show");
  harness.targetListeners.focusout({ relatedTarget: null });
  update({ scroll: () => 650, direction: 1 });
  assert.equal(harness.calls.at(-1), "hide");
  cleanup();
  assert.deepEqual(harness.targetListeners, {});
});
