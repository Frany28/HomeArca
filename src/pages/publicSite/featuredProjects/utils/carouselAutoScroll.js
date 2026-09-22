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

export {
  canResumeCarouselAutoScroll,
  canWriteCarouselAutoScroll,
};
