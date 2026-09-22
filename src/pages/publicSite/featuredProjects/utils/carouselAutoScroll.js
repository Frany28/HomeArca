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

export {
  advanceCarouselAutoPosition,
  canResumeCarouselAutoScroll,
  canWriteCarouselAutoScroll,
};
