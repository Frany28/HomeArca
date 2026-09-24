const HOME_SCROLL_PHASES = Object.freeze({
  IMAGE: "image",
  TITLE: "title",
  EFFECT: "effect",
});

const HOME_SCROLL_DIRECTIONS = Object.freeze({
  UP: -1,
  DOWN: 1,
});

const WHEEL_LINE_HEIGHT_PX = 16;
const WHEEL_REARM_MIN_DELAY_MS = 220;
const WHEEL_DECAY_MAGNITUDE_PX = 6;
const WHEEL_DISCRETE_IMPULSE_MIN_PX = 50;
const TRACKPAD_WHEEL_DELTA_SCALE = 0.45;
const WHEEL_NEW_IMPULSE_MAGNITUDE_PX = 10;
const WHEEL_NEW_IMPULSE_RATIO = 1.8;
const STATEMENT_MIN_TRAVEL_PX = 650;
const STATEMENT_MAX_TRAVEL_PX = 900;
const STATEMENT_TRAVEL_VIEWPORT_RATIO = 0.85;
const STATEMENT_INITIAL_MASK_SCALE = 180;
const STATEMENT_WHEEL_DELTA_LIMIT_PX = 48;
const FEATURED_EXPANSION_MIN_TRAVEL_PX = 420;
const FEATURED_EXPANSION_VIEWPORT_RATIO = 1;

function clampHomeStatementProgress(progress) {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(Math.max(progress, 0), 1);
}

function getHomeStatementTravelDistance(viewportHeight) {
  const safeViewportHeight = Number.isFinite(viewportHeight)
    ? viewportHeight
    : 0;

  return Math.min(
    Math.max(
      safeViewportHeight * STATEMENT_TRAVEL_VIEWPORT_RATIO,
      STATEMENT_MIN_TRAVEL_PX,
    ),
    STATEMENT_MAX_TRAVEL_PX,
  );
}

function advanceHomeStatementProgress(
  progress,
  deltaY,
  viewportHeight,
  reduceMotion = false,
) {
  const currentProgress = clampHomeStatementProgress(progress);

  if (!Number.isFinite(deltaY) || deltaY === 0) {
    return currentProgress;
  }

  if (reduceMotion) {
    return deltaY > 0 ? 1 : 0;
  }

  return clampHomeStatementProgress(
    currentProgress + deltaY / getHomeStatementTravelDistance(viewportHeight),
  );
}

function limitHomeStatementWheelDelta(
  deltaY,
  limit = STATEMENT_WHEEL_DELTA_LIMIT_PX,
) {
  if (!Number.isFinite(deltaY) || !Number.isFinite(limit) || limit <= 0) {
    return 0;
  }

  return Math.min(Math.max(deltaY, -limit), limit);
}

function clampFeaturedExpansionProgress(progress) {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(Math.max(progress, 0), 1);
}

function getFeaturedExpansionTravelDistance(viewportHeight) {
  const safeViewportHeight = Number.isFinite(viewportHeight)
    ? viewportHeight
    : 0;

  return Math.max(
    safeViewportHeight * FEATURED_EXPANSION_VIEWPORT_RATIO,
    FEATURED_EXPANSION_MIN_TRAVEL_PX,
  );
}

function advanceFeaturedExpansionProgress(
  progress,
  deltaY,
  viewportHeight,
) {
  const currentProgress = clampFeaturedExpansionProgress(progress);
  if (!Number.isFinite(deltaY) || deltaY === 0) return currentProgress;

  return clampFeaturedExpansionProgress(
    currentProgress +
      deltaY / getFeaturedExpansionTravelDistance(viewportHeight),
  );
}

function getHomeStatementVisualState(progress) {
  const normalizedProgress = clampHomeStatementProgress(progress);

  return {
    progress: normalizedProgress,
    maskScale: normalizedProgress <= 0
      ? STATEMENT_INITIAL_MASK_SCALE
      : normalizedProgress >= 1
        ? 1
        : Math.exp(
            Math.log(STATEMENT_INITIAL_MASK_SCALE) * (1 - normalizedProgress),
          ),
  };
}

function getHomeStatementTransform(progress, anchorX, anchorY) {
  const { maskScale } = getHomeStatementVisualState(progress);
  const safeAnchorX = Number.isFinite(anchorX) ? anchorX : 0;
  const safeAnchorY = Number.isFinite(anchorY) ? anchorY : 0;

  return {
    scale: maskScale,
    translateX: safeAnchorX * (1 - maskScale),
    translateY: safeAnchorY * (1 - maskScale),
  };
}

function createWheelGestureState() {
  return {
    accumulator: 0,
    direction: null,
    consumed: false,
    idle: true,
    triggeredDirection: null,
    lastMagnitude: 0,
    minimumMagnitudeAfterTrigger: Number.POSITIVE_INFINITY,
    lastTriggerTime: Number.NEGATIVE_INFINITY,
    oppositeAccumulator: 0,
    rearmAccumulator: 0,
    rearmLastMagnitude: 0,
  };
}

function markWheelGestureIdle() {
  /*
   * Historical calibration restored from 2026-09-04:
   * a real idle period starts a completely fresh physical gesture.
   * Keeping consumed/rearm state across idle made both trackpads and
   * discrete mouse wheels feel sticky or inconsistent.
   */
  return createWheelGestureState();
}

function consumeWheelGesture(state, deltaY, eventTime = 0) {
  const currentState = state ?? createWheelGestureState();
  const direction = deltaY >= 0
    ? HOME_SCROLL_DIRECTIONS.DOWN
    : HOME_SCROLL_DIRECTIONS.UP;
  const magnitude = Math.abs(deltaY);

  return {
    ...currentState,
    accumulator: deltaY,
    direction,
    consumed: true,
    idle: false,
    triggeredDirection: null,
    lastMagnitude: magnitude,
    minimumMagnitudeAfterTrigger: Number.POSITIVE_INFINITY,
    lastTriggerTime: eventTime,
    oppositeAccumulator: 0,
    rearmAccumulator: 0,
    rearmLastMagnitude: 0,
  };
}

function advanceWheelGesture(
  state,
  deltaY,
  threshold = 32,
  eventTime = 0,
) {
  if (!Number.isFinite(deltaY) || deltaY === 0) {
    return {
      ...(state ?? createWheelGestureState()),
      triggeredDirection: null,
    };
  }

  const currentState = state ?? createWheelGestureState();
  const direction =
    deltaY > 0
      ? HOME_SCROLL_DIRECTIONS.DOWN
      : HOME_SCROLL_DIRECTIONS.UP;
  const magnitude = Math.abs(deltaY);

  if (currentState.consumed) {
    const sameDirection = currentState.direction === direction;
    const minimumMagnitudeAfterTrigger = sameDirection
      ? Math.min(currentState.minimumMagnitudeAfterTrigger, magnitude)
      : currentState.minimumMagnitudeAfterTrigger;
    const enoughTimePassed =
      eventTime - currentState.lastTriggerTime >= WHEEL_REARM_MIN_DELAY_MS;
    const directionChanged =
      !sameDirection && magnitude >= WHEEL_NEW_IMPULSE_MAGNITUDE_PX;
    const newSameDirectionImpulse =
      sameDirection &&
      minimumMagnitudeAfterTrigger <= WHEEL_DECAY_MAGNITUDE_PX &&
      magnitude >= WHEEL_NEW_IMPULSE_MAGNITUDE_PX &&
      magnitude >= currentState.lastMagnitude * WHEEL_NEW_IMPULSE_RATIO;

    if (
      !enoughTimePassed ||
      (!directionChanged && !newSameDirectionImpulse)
    ) {
      return {
        ...currentState,
        idle: false,
        triggeredDirection: null,
        lastMagnitude: magnitude,
        minimumMagnitudeAfterTrigger,
        oppositeAccumulator: 0,
        rearmAccumulator: 0,
        rearmLastMagnitude: 0,
      };
    }

    const consumed = magnitude >= threshold;

    return {
      accumulator: deltaY,
      direction,
      consumed,
      idle: false,
      triggeredDirection: consumed ? direction : null,
      lastMagnitude: magnitude,
      minimumMagnitudeAfterTrigger: Number.POSITIVE_INFINITY,
      lastTriggerTime: consumed ? eventTime : currentState.lastTriggerTime,
      oppositeAccumulator: 0,
      rearmAccumulator: 0,
      rearmLastMagnitude: 0,
    };
  }

  const accumulator =
    currentState.direction !== null &&
    currentState.direction !== direction
      ? deltaY
      : currentState.accumulator + deltaY;
  const consumed = Math.abs(accumulator) >= threshold;

  return {
    accumulator,
    direction,
    consumed,
    idle: false,
    triggeredDirection: consumed ? direction : null,
    lastMagnitude: magnitude,
    minimumMagnitudeAfterTrigger: Number.POSITIVE_INFINITY,
    lastTriggerTime: consumed ? eventTime : currentState.lastTriggerTime,
    oppositeAccumulator: 0,
    rearmAccumulator: 0,
    rearmLastMagnitude: 0,
  };
}

function createHomeScrollState({
  panelIndex = 0,
  phase = HOME_SCROLL_PHASES.TITLE,
  entryDirection = null,
} = {}) {
  return { panelIndex, phase, entryDirection };
}

function getNextHomeScrollState(
  state,
  direction,
  panelCount,
  { skipCurrentImageReveal = false } = {},
) {
  if (
    !state ||
    !Number.isInteger(panelCount) ||
    panelCount <= 0 ||
    ![HOME_SCROLL_DIRECTIONS.UP, HOME_SCROLL_DIRECTIONS.DOWN].includes(
      direction,
    )
  ) {
    return state;
  }

  if (state.phase === HOME_SCROLL_PHASES.IMAGE && !skipCurrentImageReveal) {
    return createHomeScrollState({
      panelIndex: state.panelIndex,
      phase: HOME_SCROLL_PHASES.TITLE,
    });
  }

  const nextPanelIndex = state.panelIndex + direction;

  if (nextPanelIndex < 0 || nextPanelIndex >= panelCount) {
    return state;
  }

  return createHomeScrollState({
    panelIndex: nextPanelIndex,
    phase: HOME_SCROLL_PHASES.IMAGE,
    entryDirection: direction,
  });
}

function createScrollbarHomeScrollState(panelIndex, { settled = true } = {}) {
  return createHomeScrollState({
    panelIndex,
    phase: settled ? HOME_SCROLL_PHASES.TITLE : HOME_SCROLL_PHASES.IMAGE,
    entryDirection: null,
  });
}

function normalizeWheelDelta({ deltaX = 0, deltaY = 0, deltaMode = 0 }, viewportHeight) {
  const multiplier =
    deltaMode === 1
      ? WHEEL_LINE_HEIGHT_PX
      : deltaMode === 2
        ? Math.max(viewportHeight, 1)
        : 1;

  return {
    x: deltaX * multiplier,
    y: deltaY * multiplier,
  };
}

function getWheelGestureDeltaScale({ deltaY = 0, deltaMode = 0 }) {
  if (
    deltaMode === 0 &&
    Math.abs(deltaY) > 0 &&
    Math.abs(deltaY) < WHEEL_DISCRETE_IMPULSE_MIN_PX
  ) {
    return TRACKPAD_WHEEL_DELTA_SCALE;
  }

  return 1;
}

function getSwipeDirection(
  { startX, startY, endX, endY },
  { threshold = 48, verticalDominance = 1.2 } = {},
) {
  const horizontalDistance = endX - startX;
  const verticalDistance = startY - endY;

  if (
    Math.abs(verticalDistance) < threshold ||
    Math.abs(verticalDistance) < Math.abs(horizontalDistance) * verticalDominance
  ) {
    return null;
  }

  return verticalDistance > 0
    ? HOME_SCROLL_DIRECTIONS.DOWN
    : HOME_SCROLL_DIRECTIONS.UP;
}

function getKeyboardDirection({ key, shiftKey = false }) {
  if (key === "ArrowDown" || key === "PageDown" || (key === " " && !shiftKey)) {
    return HOME_SCROLL_DIRECTIONS.DOWN;
  }

  if (key === "ArrowUp" || key === "PageUp" || (key === " " && shiftKey)) {
    return HOME_SCROLL_DIRECTIONS.UP;
  }

  return null;
}

function getNearestPanelIndex(scrollTop, panelOffsets) {
  if (!Array.isArray(panelOffsets) || panelOffsets.length === 0) {
    return 0;
  }

  return panelOffsets.reduce((nearestIndex, offset, index) =>
    Math.abs(offset - scrollTop) <
    Math.abs(panelOffsets[nearestIndex] - scrollTop)
      ? index
      : nearestIndex,
  0);
}

function getSequentialScrollbarPanelIndex(
  currentPanelIndex,
  requestedPanelIndex,
  panelCount,
) {
  if (
    !Number.isInteger(currentPanelIndex) ||
    !Number.isInteger(requestedPanelIndex) ||
    !Number.isInteger(panelCount) ||
    panelCount <= 0
  ) {
    return 0;
  }

  const safeCurrentPanelIndex = Math.min(
    Math.max(currentPanelIndex, 0),
    panelCount - 1,
  );
  const direction = Math.sign(requestedPanelIndex - safeCurrentPanelIndex);

  return Math.min(
    Math.max(safeCurrentPanelIndex + direction, 0),
    panelCount - 1,
  );
}

export {
  HOME_SCROLL_DIRECTIONS,
  HOME_SCROLL_PHASES,
  advanceFeaturedExpansionProgress,
  advanceHomeStatementProgress,
  advanceWheelGesture,
  clampHomeStatementProgress,
  clampFeaturedExpansionProgress,
  consumeWheelGesture,
  createHomeScrollState,
  createScrollbarHomeScrollState,
  createWheelGestureState,
  getKeyboardDirection,
  getNearestPanelIndex,
  getNextHomeScrollState,
  getSequentialScrollbarPanelIndex,
  getHomeStatementTravelDistance,
  getHomeStatementTransform,
  getHomeStatementVisualState,
  getFeaturedExpansionTravelDistance,
  getWheelGestureDeltaScale,
  getSwipeDirection,
  limitHomeStatementWheelDelta,
  markWheelGestureIdle,
  normalizeWheelDelta,
};
