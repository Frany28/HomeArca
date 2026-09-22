const VIEWPORT_RESIZE_EPSILON_PX = 1;

const VIEWPORT_RESIZE_KINDS = Object.freeze({
  UNCHANGED: "UNCHANGED",
  TRANSIENT_MOBILE_HEIGHT: "TRANSIENT_MOBILE_HEIGHT",
  LAYOUT: "LAYOUT",
});

function classifyViewportResize({
  previousWidth,
  previousHeight,
  nextWidth,
  nextHeight,
  hasVisualViewport = false,
  coarsePointer = false,
}) {
  const widthChanged =
    Math.abs(nextWidth - previousWidth) > VIEWPORT_RESIZE_EPSILON_PX;
  const heightChanged =
    Math.abs(nextHeight - previousHeight) > VIEWPORT_RESIZE_EPSILON_PX;

  if (!widthChanged && !heightChanged) {
    return VIEWPORT_RESIZE_KINDS.UNCHANGED;
  }

  if (
    hasVisualViewport &&
    coarsePointer &&
    !widthChanged &&
    heightChanged
  ) {
    return VIEWPORT_RESIZE_KINDS.TRANSIENT_MOBILE_HEIGHT;
  }

  return VIEWPORT_RESIZE_KINDS.LAYOUT;
}

export {
  VIEWPORT_RESIZE_KINDS,
  classifyViewportResize,
};
