function canWriteCarouselAutoScroll({
  interactionActive = false,
  paused = false,
}) {
  return !interactionActive && !paused;
}

function shouldPauseCarouselAutoScroll({
  currentScrollLeft,
  expectedScrollLeft,
  interactionActive = false,
  paused = false,
  tolerance = 1,
}) {
  return (
    interactionActive ||
    paused ||
    Math.abs(currentScrollLeft - expectedScrollLeft) > tolerance
  );
}

function canResumeCarouselAutoScroll({
  interactionActive = false,
  scrollSettled = false,
}) {
  return !interactionActive && scrollSettled;
}

export {
  canResumeCarouselAutoScroll,
  canWriteCarouselAutoScroll,
  shouldPauseCarouselAutoScroll,
};
