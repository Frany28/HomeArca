const FEATURED_TOUCH_AXES = Object.freeze({
  HORIZONTAL: "HORIZONTAL",
  PENDING: "PENDING",
  VERTICAL: "VERTICAL",
});

function canControlFeaturedTouchGesture({
  activeTween = false,
  isProgrammaticScroll = false,
}) {
  return !activeTween && !isProgrammaticScroll;
}

function resolveFeaturedTouchAxis({
  deltaX,
  deltaY,
  nativeHorizontalTarget = false,
  threshold = 8,
  dominance = 1.2,
}) {
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);

  if (Math.max(absoluteX, absoluteY) < threshold) {
    return FEATURED_TOUCH_AXES.PENDING;
  }

  if (
    nativeHorizontalTarget &&
    absoluteX >= absoluteY * dominance
  ) {
    return FEATURED_TOUCH_AXES.HORIZONTAL;
  }

  if (absoluteY >= absoluteX * dominance) {
    return FEATURED_TOUCH_AXES.VERTICAL;
  }

  return FEATURED_TOUCH_AXES.PENDING;
}

function createControlledFeaturedTouchGesture({
  bounds,
  nativeHorizontalTarget = false,
  pointerId,
  startScrollTop,
  startX,
  startY,
}) {
  return {
    axis: FEATURED_TOUCH_AXES.PENDING,
    bounds,
    consumed: false,
    nativeHorizontalTarget,
    pointerId,
    startScrollTop,
    startX,
    startY,
    transitionAttempted: false,
  };
}

function advanceControlledFeaturedTouchGesture(
  gesture,
  {
    clientX,
    clientY,
    axisThreshold = 8,
    transitionThreshold = 18,
    dominance = 1.2,
  },
) {
  if (!gesture || gesture.consumed) {
    return {
      gesture,
      ownsVertical: gesture?.axis === FEATURED_TOUCH_AXES.VERTICAL,
      scrollTop: null,
      transitionDirection: null,
    };
  }

  const deltaX = clientX - gesture.startX;
  const verticalDistance = gesture.startY - clientY;
  const axis = gesture.axis === FEATURED_TOUCH_AXES.PENDING
    ? resolveFeaturedTouchAxis({
        deltaX,
        deltaY: verticalDistance,
        nativeHorizontalTarget: gesture.nativeHorizontalTarget,
        threshold: axisThreshold,
        dominance,
      })
    : gesture.axis;
  const nextGesture = { ...gesture, axis };

  if (axis !== FEATURED_TOUCH_AXES.VERTICAL) {
    return {
      gesture: nextGesture,
      ownsVertical: false,
      scrollTop: null,
      transitionDirection: null,
    };
  }

  const bounds = gesture.bounds;
  if (!bounds) {
    return {
      gesture: nextGesture,
      ownsVertical: true,
      scrollTop: null,
      transitionDirection: null,
    };
  }

  const projectedScrollTop = gesture.startScrollTop + verticalDistance;
  const scrollTop = Math.min(
    Math.max(projectedScrollTop, bounds.start),
    bounds.end,
  );
  const direction = Math.sign(verticalDistance);
  const boundaryOvershoot = direction > 0
    ? projectedScrollTop - bounds.end
    : bounds.start - projectedScrollTop;
  const reachedBoundary =
    direction !== 0 && boundaryOvershoot >= transitionThreshold;

  if (!reachedBoundary || nextGesture.transitionAttempted) {
    return {
      gesture: nextGesture,
      ownsVertical: true,
      scrollTop,
      transitionDirection: null,
    };
  }

  return {
    gesture: {
      ...nextGesture,
      consumed: true,
      transitionAttempted: true,
    },
    ownsVertical: true,
    scrollTop,
    transitionDirection: direction,
  };
}

export {
  FEATURED_TOUCH_AXES,
  advanceControlledFeaturedTouchGesture,
  canControlFeaturedTouchGesture,
  createControlledFeaturedTouchGesture,
  resolveFeaturedTouchAxis,
};
