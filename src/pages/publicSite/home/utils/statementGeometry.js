import { VIEWPORT_RESIZE_KINDS } from "./viewportResize.js";

const STATEMENT_GEOMETRY_SETTLE_MS = 180;

function shouldDeferStatementGeometryResize(resizeKind) {
  return resizeKind === VIEWPORT_RESIZE_KINDS.TRANSIENT_MOBILE_HEIGHT;
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
  isStatementGeometrySettled,
  shouldDeferStatementGeometryResize,
};
