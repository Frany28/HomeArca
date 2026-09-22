const CAROUSEL_AXIS_THRESHOLD_PX = 12;
const CAROUSEL_AXIS_BIAS = 1.4;

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
  advanceCarouselAutoPosition,
  canResumeCarouselAutoScroll,
  canWriteCarouselAutoScroll,
  normalizeCarouselLoopPosition,
  resolveCarouselGestureAxis,
};
