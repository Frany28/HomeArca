import { VIEWPORT_RESIZE_KINDS } from "./viewportResize.js";

const STATEMENT_GEOMETRY_SETTLE_MS = 180;

function shouldDeferStatementGeometryResize(resizeKind) {
  return resizeKind === VIEWPORT_RESIZE_KINDS.TRANSIENT_MOBILE_HEIGHT;
}

function isUsableStatementBounds(bounds) {
  return Boolean(
    bounds &&
      Number.isFinite(bounds.x) &&
      Number.isFinite(bounds.y) &&
      Number.isFinite(bounds.width) &&
      Number.isFinite(bounds.height) &&
      bounds.width > 0 &&
      bounds.height > 0
  );
}

function readStatementBounds(readBounds) {
  if (typeof readBounds !== "function") return null;

  try {
    const bounds = readBounds();
    return isUsableStatementBounds(bounds) ? bounds : null;
  } catch {
    return null;
  }
}

function getStatementFocusBounds({
  focusGlyph,
  focusLetterIndex = -1,
  maskText,
}) {
  if (!maskText) return null;

  /*
   * WebKit can report an empty getBBox() for a nested <tspan> while an SVG
   * has just changed from visibility:hidden to visible. SVGTextContentElement
   * character geometry is more stable there, so prefer it when available.
   */
  if (
    Number.isInteger(focusLetterIndex) &&
    focusLetterIndex >= 0 &&
    typeof maskText.getExtentOfChar === "function"
  ) {
    const characterBounds = readStatementBounds(() =>
      maskText.getExtentOfChar(focusLetterIndex),
    );
    if (characterBounds) return characterBounds;
  }

  const glyphBounds = readStatementBounds(() => focusGlyph?.getBBox());
  if (glyphBounds) return glyphBounds;

  /*
   * Last-resort cross-browser fallback: keep the effect functional and
   * centered even if per-character metrics are temporarily unavailable.
   */
  return readStatementBounds(() => maskText.getBBox());
}

function isStatementGeometrySettled({
  animationHasProgressed = false,
  effectStarted = false,
  progress = 0,
  statementVisible = false,
}) {
  if (!effectStarted || statementVisible || progress >= 1) return true;
  return progress <= 0 && animationHasProgressed;
}

function createStatementGeometryRefreshQueue({
  cancelFrame,
  clearTimer,
  measure,
  requestFrame,
  setTimer,
  settleDelay = STATEMENT_GEOMETRY_SETTLE_MS,
}) {
  let frameId = 0;
  let pending = false;
  let timerId;

  const flushIfSettled = (isSettled) => {
    if (!pending || frameId || !isSettled()) return false;

    frameId = requestFrame(() => {
      frameId = 0;
      if (pending && isSettled()) measure();
    });
    return true;
  };

  const defer = (isSettled) => {
    pending = true;
    clearTimer(timerId);
    timerId = setTimer(() => {
      timerId = undefined;
      flushIfSettled(isSettled);
    }, settleDelay);
  };

  return {
    complete() {
      pending = false;
      clearTimer(timerId);
      timerId = undefined;
    },
    defer,
    destroy() {
      cancelFrame(frameId);
      clearTimer(timerId);
      frameId = 0;
      timerId = undefined;
      pending = false;
    },
    flushIfSettled,
    isPending: () => pending,
    markPending() {
      pending = true;
    },
  };
}

export {
  STATEMENT_GEOMETRY_SETTLE_MS,
  createStatementGeometryRefreshQueue,
  getStatementFocusBounds,
  isStatementGeometrySettled,
  isUsableStatementBounds,
  shouldDeferStatementGeometryResize,
};
