const CAROUSEL_AXIS_THRESHOLD_PX = 12;
const CAROUSEL_AXIS_BIAS = 1.4;
const CAROUSEL_DRAG_RESPONSE = 0.42;
const CAROUSEL_ACTIVE_DRAG_RESPONSE = 0.68;
const CAROUSEL_SETTLE_DRAG_RESPONSE = 0.34;

function canWriteCarouselAutoScroll({
  interactionActive = false,
  paused = false,
}) {
  return !interactionActive && !paused;
}

function canResumeCarouselAutoScroll({
  interactionActive = false,
  scrollSettled = false,
}) {
  return !interactionActive && scrollSettled;
}

function smoothCarouselDragPosition(
  currentPosition,
  targetPosition,
  elapsedSeconds,
  response = CAROUSEL_DRAG_RESPONSE,
) {
  const current = Number.isFinite(currentPosition)
    ? currentPosition
    : 0;
  const target = Number.isFinite(targetPosition)
    ? targetPosition
    : current;
  const elapsed = Number.isFinite(elapsedSeconds)
    ? Math.max(0, elapsedSeconds)
    : 0;
  const safeResponse = Number.isFinite(response)
    ? Math.min(Math.max(response, 0), 1)
    : CAROUSEL_DRAG_RESPONSE;

  if (elapsed <= 0 || safeResponse <= 0) return current;
  if (safeResponse >= 1) return target;

  const equivalentFrames = elapsed * 60;
  const blend = 1 - Math.pow(1 - safeResponse, equivalentFrames);

  return current + (target - current) * blend;
}

function advanceCarouselAutoPosition(
  currentPosition,
  elapsedSeconds,
  loopDistance,
  speedPxPerSecond,
) {
  const safePosition = Number.isFinite(currentPosition)
    ? currentPosition
    : 0;
  const safeElapsed = Number.isFinite(elapsedSeconds)
    ? Math.max(0, elapsedSeconds)
    : 0;
  const safeSpeed = Number.isFinite(speedPxPerSecond)
    ? Math.max(0, speedPxPerSecond)
    : 0;

  let nextPosition =
    safePosition + safeSpeed * safeElapsed;

  if (Number.isFinite(loopDistance) && loopDistance > 0) {
    nextPosition %= loopDistance;
  }

  return nextPosition;
}

function resolveCarouselGestureAxis(
  deltaX,
  deltaY,
  {
    bias = CAROUSEL_AXIS_BIAS,
    threshold = CAROUSEL_AXIS_THRESHOLD_PX,
  } = {},
) {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (Math.max(absX, absY) < threshold) return null;

  /*
   * Vertical navigation has priority. Horizontal ownership is granted only
   * when X clearly dominates Y; every other deliberate vertical/diagonal
   * gesture is left to the page.
   */
  if (
    absX >= threshold &&
    absX >= absY * bias
  ) {
    return "horizontal";
  }

  if (absY >= threshold) return "vertical";

  return null;
}

function normalizeCarouselLoopPosition(position, loopDistance) {
  if (
    !Number.isFinite(position) ||
    !Number.isFinite(loopDistance) ||
    loopDistance <= 0
  ) {
    return Number.isFinite(position) ? position : 0;
  }

  return ((position % loopDistance) + loopDistance) % loopDistance;
}

export {
  CAROUSEL_AXIS_BIAS,
  CAROUSEL_AXIS_THRESHOLD_PX,
  CAROUSEL_ACTIVE_DRAG_RESPONSE,
  CAROUSEL_DRAG_RESPONSE,
  CAROUSEL_SETTLE_DRAG_RESPONSE,
  advanceCarouselAutoPosition,
  canResumeCarouselAutoScroll,
  canWriteCarouselAutoScroll,
  normalizeCarouselLoopPosition,
  resolveCarouselGestureAxis,
  smoothCarouselDragPosition,
};
