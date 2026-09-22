const TOUCH_GESTURE_OWNERS = Object.freeze({
  CONTROLLED_VERTICAL: "CONTROLLED_VERTICAL",
  NATIVE_VERTICAL: "NATIVE_VERTICAL",
  NATIVE_HORIZONTAL: "NATIVE_HORIZONTAL",
});

function getTouchGestureOwner({
  contentMode,
  featuredProjectReady = false,
  featuredExpansionEnabled = false,
  interactiveTarget = false,
  nativeHorizontalTarget = false,
}) {
  if (nativeHorizontalTarget) {
    return TOUCH_GESTURE_OWNERS.NATIVE_HORIZONTAL;
  }

  if (interactiveTarget) {
    return TOUCH_GESTURE_OWNERS.NATIVE_VERTICAL;
  }

  if (!contentMode) {
    return TOUCH_GESTURE_OWNERS.CONTROLLED_VERTICAL;
  }

  if (featuredProjectReady && featuredExpansionEnabled) {
    return TOUCH_GESTURE_OWNERS.CONTROLLED_VERTICAL;
  }

  return TOUCH_GESTURE_OWNERS.NATIVE_VERTICAL;
}

export {
  TOUCH_GESTURE_OWNERS,
  getTouchGestureOwner,
};
