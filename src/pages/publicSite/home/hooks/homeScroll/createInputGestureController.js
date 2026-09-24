import {
  HOME_SCROLL_DIRECTIONS,
  advanceFeaturedExpansionProgress,
  limitHomeStatementWheelDelta,
  advanceHomeStatementProgress,
  advanceWheelGesture,
  getKeyboardDirection,
  getSwipeDirection,
  getWheelGestureDeltaScale,
  markWheelGestureIdle,
  normalizeWheelDelta,
} from "../../utils/homeScrollNavigation.js";
import {
  TOUCH_GESTURE_OWNERS,
  clearTouchGestureForPointer,
  getTouchGestureOwner,
} from "../../utils/touchGestureOwnership.js";
import {
  FEATURED_PROJECT_EDGE_TOLERANCE_PX,
  STATEMENT_PANEL_INDEX,
  TOUCH_SWIPE_THRESHOLD_PX,
  TOUCH_VERTICAL_DOMINANCE,
  TRACKPAD_WHEEL_GESTURE_THRESHOLD_PX,
  WHEEL_GESTURE_IDLE_MS,
  WHEEL_GESTURE_THRESHOLD_PX,
  WHEEL_VERTICAL_DOMINANCE,
} from "./homeScrollConstants.js";

function isInteractiveTarget(target) {
  return (
    target instanceof Element &&
    Boolean(target.closest(
      'a, button, input, select, textarea, [contenteditable="true"], [role="button"]',
    ))
  );
}

function isNativeHorizontalTarget(target) {
  return (
    target instanceof Element &&
    Boolean(target.closest("[data-native-horizontal-scroll]"))
  );
}

const FEATURED_TOUCH_SWIPE_THRESHOLD_PX = 18;
const FEATURED_TOUCH_UP_BOUNDARY_THRESHOLD_PX = 10;

function shouldClaimTouchUpBoundary({
  boundaryScrollTop,
  currentX,
  currentY,
  startScrollTop,
  startX,
  startY,
  threshold = FEATURED_TOUCH_UP_BOUNDARY_THRESHOLD_PX,
  verticalDominance = TOUCH_VERTICAL_DOMINANCE,
}) {
  if (
    !Number.isFinite(boundaryScrollTop) ||
    !Number.isFinite(startScrollTop)
  ) {
    return false;
  }

  const horizontalDistance = currentX - startX;
  const verticalDistance = startY - currentY;
  const absoluteVerticalDistance = Math.abs(verticalDistance);

  /*
   * Previous-section navigation means the finger moves down, so the intended
   * scroll delta is negative. Diagonal/horizontal gestures stay untouched.
   */
  if (verticalDistance >= -threshold) return false;
  if (
    absoluteVerticalDistance <
    Math.abs(horizontalDistance) * verticalDominance
  ) {
    return false;
  }

  const projectedScrollTop =
    startScrollTop + verticalDistance;
  const startedAtBoundary =
    startScrollTop <=
    boundaryScrollTop + FEATURED_PROJECT_EDGE_TOLERANCE_PX;

  return (
    startedAtBoundary ||
    projectedScrollTop <= boundaryScrollTop - threshold
  );
}

function createInputGestureController({
  titleRevealLockedRef,
  activeFeaturedProjectIndexRef,
  activeSectionRef,
  coordination,
  navigationStateRef,
  reduceMotion,
  runtime,
  scroller,
  statement,
}) {
  let touchGesture = null;
  let upwardBoundaryTouch = null;

 const settleWheelGesture = () => {
    runtime.wheelGestureState =
      markWheelGestureIdle(runtime.wheelGestureState);

    runtime.wheelGestureDeltaScale = null;

    statement.resetWheelScrubbing();

    coordination.about?.settleGesture();

    coordination.featured?.settleProcessReturnGesture();

    /*
     * Si una transición de panel terminó, solo liberamos la navegación
     * después de una pausa real del gesto. De esta forma la cola/inercia
     * del trackpad no cuenta como el segundo scroll que revela el título.
     */
    if (!runtime.activeTween && !runtime.isProgrammaticScroll) {
      runtime.wheelTransitionLock = false;
    }
  };

  const scheduleWheelGestureSettlement = () => {
    window.clearTimeout(runtime.wheelIdleTimer);
    runtime.wheelIdleTimer = window.setTimeout(
      settleWheelGesture,
      WHEEL_GESTURE_IDLE_MS,
    );
  };

  const requireFreshWheelGesture = () => {
    runtime.wheelTransitionLock = true;
    runtime.wheelGestureState = markWheelGestureIdle(
      runtime.wheelGestureState,
    );
    scheduleWheelGestureSettlement();
  };

  const releaseWheelTransitionLock = () => {
    runtime.wheelTransitionLock = false;
  };

  const getWheelIntentThreshold = () =>
    runtime.wheelGestureDeltaScale !== null &&
    runtime.wheelGestureDeltaScale < 1
      ? TRACKPAD_WHEEL_GESTURE_THRESHOLD_PX
      : WHEEL_GESTURE_THRESHOLD_PX;

  const observeConsumedWheelGesture = (deltaY, eventTime) => {
    /*
     * Igual que en la calibración estable del 4-sep, incluso mientras una
     * transición está activa seguimos observando la curva del wheel. Así la
     * cola de inercia puede decaer y un impulso realmente nuevo se distingue
     * del gesto físico que originó la transición.
     */
    const observedGesture = advanceWheelGesture(
      runtime.wheelGestureState,
      deltaY,
      getWheelIntentThreshold(),
      eventTime,
    );

    runtime.wheelGestureState = {
      ...observedGesture,
      triggeredDirection: null,
    };
  };

  const debugWheel = (event, normalizedDelta, scaledDelta, direction, decision) => {
     if (!window.__ARCA_DEBUG_WHEEL__) return;
    const currentState = navigationStateRef.current;
    const featuredIndex = activeFeaturedProjectIndexRef.current;
    const gesture = runtime.wheelGestureState;

    console.debug("[home-wheel]", {
      timestamp: event.timeStamp,
      deltaY: event.deltaY,
      deltaMode: event.deltaMode,
      normalizedDelta,
      scaledDelta,
      direction,
      wheelGestureState: { ...gesture },
      accumulator: gesture.accumulator,
      gestureDirection: gesture.direction,
      consumed: gesture.consumed,
      idle: gesture.idle,
      triggeredDirection: gesture.triggeredDirection,
      lastMagnitude: gesture.lastMagnitude,
      minimumMagnitudeAfterTrigger: gesture.minimumMagnitudeAfterTrigger,
      oppositeAccumulator: gesture.oppositeAccumulator,
      rearmAccumulator: gesture.rearmAccumulator,
      rearmLastMagnitude: gesture.rearmLastMagnitude,
      wheelTransitionLock: runtime.wheelTransitionLock,
      wheelGestureDeltaScale: runtime.wheelGestureDeltaScale,
      titleRevealLocked: titleRevealLockedRef.current,
      activeTween: Boolean(runtime.activeTween),
      isProgrammaticScroll: runtime.isProgrammaticScroll,
      contentMode: runtime.contentMode,
      panelIndex: currentState.panelIndex,
      phase: currentState.phase,
      activeSection: activeSectionRef.current,
      activeFeaturedProjectIndex: featuredIndex,
      featuredExpansionProgress:
        activeSectionRef.current === "featured-projects"
          ? coordination.featured.getExpansionProgress(featuredIndex)
          : null,
      decision,
    });
  };

  const handleWheel = (event) => {
    if (event.ctrlKey) {
      debugWheel(event, { x: 0, y: 0 }, { x: 0, y: 0 }, null, "IGNORED_CTRL_KEY");
      return;
    }
    const normalizedDelta = normalizeWheelDelta(event, scroller.clientHeight);
    if (
      Math.abs(normalizedDelta.y) <=
      Math.abs(normalizedDelta.x) * WHEEL_VERTICAL_DOMINANCE
    ) {
      debugWheel(event, normalizedDelta, normalizedDelta, null, "IGNORED_DIAGONAL");
      return;
    }

    const currentGestureScale = getWheelGestureDeltaScale(event);

      runtime.wheelGestureDeltaScale =
      runtime.wheelGestureDeltaScale === null
    ? currentGestureScale
    : Math.min(
        runtime.wheelGestureDeltaScale,
        currentGestureScale,
      );
    const wheelIntentDelta = normalizedDelta.y;
    const progressDelta = {
      x: normalizedDelta.x * runtime.wheelGestureDeltaScale,
      y: normalizedDelta.y * runtime.wheelGestureDeltaScale,
    };
    if (
      statement.isAutoRevealing() &&
      navigationStateRef.current.panelIndex === STATEMENT_PANEL_INDEX
    ) {
      event.preventDefault();
      event.stopPropagation?.();
      observeConsumedWheelGesture(wheelIntentDelta, event.timeStamp);
      scheduleWheelGestureSettlement();
      debugWheel(
        event,
        normalizedDelta,
        progressDelta,
        Math.sign(normalizedDelta.y),
        "BLOCKED_STATEMENT_AUTO_REVEAL",
      );
      return;
    }
    if (runtime.activeTween || runtime.isProgrammaticScroll) {
      event.preventDefault();
      event.stopPropagation?.();
      observeConsumedWheelGesture(
        wheelIntentDelta,
        event.timeStamp,
      );
      runtime.wheelTransitionLock = true;
      scheduleWheelGestureSettlement();
      debugWheel(
        event,
        normalizedDelta,
        progressDelta,
        Math.sign(normalizedDelta.y),
        runtime.activeTween ? "BLOCKED_ACTIVE_TWEEN" : "BLOCKED_PROGRAMMATIC_SCROLL",
      );
      return;
    }

    if (runtime.contentMode) {
            if (reduceMotion) return;

            const direction = Math.sign(normalizedDelta.y);
            if (!direction) return;
            if (
        coordination.about?.handleInput(
          event,
          progressDelta.y,
          direction,
          { smooth: true },
        )
      ) {
        debugWheel(
          event,
          normalizedDelta,
          progressDelta,
          direction,
          "ABOUT_STORY",
        );

        return;
      }
      if (
        coordination.featured.isProcessReturnGestureLocked()
      ) {
        event.preventDefault();
        event.stopPropagation?.();

        scheduleWheelGestureSettlement();

        debugWheel(
          event,
          normalizedDelta,
          progressDelta,
          direction,
          "BLOCKED_PROCESS_RETURN_INERTIA",
        );

        return;
      }
      if (coordination.featured.handleExpansionInput(
        event,
        progressDelta.y,
        direction,
        { smooth: true },
      )) {
        debugWheel(event, normalizedDelta, progressDelta, direction, "FEATURED_EXPANSION");
        return;
      }
      coordination.featured.handleBoundaryWheel(
        event,
        wheelIntentDelta,
        direction,
      );
      debugWheel(
        event,
        normalizedDelta,
        progressDelta,
        direction,
        runtime.wheelGestureState.triggeredDirection !== null
          ? "FEATURED_TRANSITION"
          : "NATIVE_CONTENT_SCROLL",
      );
      return;
    }

    event.preventDefault();
      scheduleWheelGestureSettlement();

      if (runtime.wheelTransitionLock) {
        debugWheel(
          event,
          normalizedDelta,
          progressDelta,
          Math.sign(normalizedDelta.y),
          "BLOCKED_TRANSITION_LOCK",
        );
        return;
      }
      const currentState = navigationStateRef.current;

      const isStatementReady =
        currentState.panelIndex === STATEMENT_PANEL_INDEX &&
        !runtime.activeTween;

      const currentStatementProgress =
        statement.getProgress();

      const isAutomaticStatementMode =
        window.matchMedia?.(
          "(max-width: 1023px)",
        ).matches ?? false;

      const canScrubStatementWithDesktopWheel =
        isStatementReady &&
        !isAutomaticStatementMode &&
        (
          (
            currentStatementProgress > 0 &&
            currentStatementProgress < 1
          ) ||
          (
            currentStatementProgress <= 0 &&
            progressDelta.y > 0
          ) ||
          (
            currentStatementProgress >= 1 &&
            progressDelta.y < 0
          )
        );

      if (canScrubStatementWithDesktopWheel) {
        statement.startWheelScrubbing();

        statement.queueDelta(
          limitHomeStatementWheelDelta(
            progressDelta.y,
          ),
        );

        debugWheel(
          event,
          normalizedDelta,
          progressDelta,
          Math.sign(progressDelta.y),
          "STATEMENT_DESKTOP_SCRUB",
        );

        return;
      }

      statement.stopAnimation();

    if (isStatementReady && statement.getProgress() >= 1) {
      runtime.statementEnteringUp = false;
    }
    const previousWheelGestureState = runtime.wheelGestureState;

    

    runtime.wheelGestureState = advanceWheelGesture(
      runtime.wheelGestureState,
      wheelIntentDelta,
      getWheelIntentThreshold(),
      event.timeStamp,
    );
        const triggeredDirection =
      runtime.wheelGestureState.triggeredDirection;

    if (
      triggeredDirection !== null &&
      titleRevealLockedRef.current &&
      currentState.panelIndex < STATEMENT_PANEL_INDEX
    ) {
      debugWheel(
        event,
        normalizedDelta,
        progressDelta,
        triggeredDirection,
        "BLOCKED_TITLE_REVEAL",
      );

      return;
    }
    if (isStatementReady && runtime.wheelGestureState.triggeredDirection !== null) {
      const direction = runtime.wheelGestureState.triggeredDirection;
      const currentProgress = statement.getProgress();
      if (
        currentProgress <= 0 &&
        direction === HOME_SCROLL_DIRECTIONS.UP &&
        !runtime.statementEnteringUp
      ) {
        coordination.panel.moveByDirection(direction);
        return;
      }
      if (currentProgress >= 1 && direction === HOME_SCROLL_DIRECTIONS.DOWN) {
        coordination.content.navigateSection("services");
        return;
      }

      if (
        direction === HOME_SCROLL_DIRECTIONS.UP &&
        currentProgress >= 1 &&
        window.matchMedia?.("(max-width: 1023px)").matches
      ) {
        runtime.wheelTransitionLock = true;
        statement.startAutoReverse(() => {
          coordination.panel.moveByDirection(HOME_SCROLL_DIRECTIONS.UP);
        });
        runtime.statementEnteringUp = false;
        debugWheel(event, normalizedDelta, progressDelta, direction, "STATEMENT_AUTO_REVERSE");
        return;
      }

      runtime.wheelTransitionLock = true;

      statement.animateTo(
        runtime.statementEnteringUp ||
        direction === HOME_SCROLL_DIRECTIONS.DOWN
          ? 1
          : 0,
        coordination.panel.releaseTransitionLock,
      );
      runtime.statementEnteringUp = false;
      debugWheel(event, normalizedDelta, progressDelta, direction, "STATEMENT_PHASE_TRANSITION");
      return;
    }

    if (!runtime.activeTween && runtime.wheelGestureState.triggeredDirection !== null) {
      coordination.panel.moveByDirection(runtime.wheelGestureState.triggeredDirection);
      debugWheel(
        event,
        normalizedDelta,
        progressDelta,
        runtime.wheelGestureState.triggeredDirection,
        previousWheelGestureState.rearmAccumulator !== 0
          ? "REARMED -> TRIGGER_NAVIGATION"
          : "TRIGGER_NAVIGATION",
      );
      return;
    }

    const gesture = runtime.wheelGestureState;
    const gestureDecision = gesture.oppositeAccumulator !== 0
      ? "OPPOSITE_DIRECTION"
      : gesture.consumed &&
          (gesture.rearmAccumulator !== 0 ||
            gesture.minimumMagnitudeAfterTrigger !== Number.POSITIVE_INFINITY)
        ? "REARM_WAITING"
        : gesture.consumed
          ? "CONSUMED_INERTIA"
          : "ACCUMULATING";
    debugWheel(
      event,
      normalizedDelta,
      progressDelta,
      Math.sign(normalizedDelta.y),
      gestureDecision,
    );
  };

  const canWatchUpwardTouchBoundary = () => {
    if (
      !runtime.contentMode ||
      !(window.matchMedia?.("(max-width: 1023px)").matches ?? false)
    ) {
      return false;
    }

    if (activeSectionRef.current === "process") {
      return true;
    }

    return (
      activeSectionRef.current === "featured-projects" &&
      activeFeaturedProjectIndexRef.current > 0
    );
  };

  const handleBoundaryTouchStart = (event) => {
    if (
      upwardBoundaryTouch ||
      event.touches.length !== 1 ||
      !canWatchUpwardTouchBoundary()
    ) {
      return;
    }

    const touch = event.touches[0];
    upwardBoundaryTouch = {
      consumed: false,
      identifier: touch.identifier,
      startProjectIndex: activeFeaturedProjectIndexRef.current,
      startScrollTop: scroller.scrollTop,
      startSectionId: activeSectionRef.current,
      startX: touch.clientX,
      startY: touch.clientY,
    };
  };

  const handleBoundaryTouchMove = (event) => {
    const gesture = upwardBoundaryTouch;
    if (!gesture) return;

    const touch = Array.from(event.touches).find(
      (candidate) => candidate.identifier === gesture.identifier,
    );
    if (!touch) return;

    if (gesture.consumed) {
      event.preventDefault();
      return;
    }

    const navigationChanged =
      activeSectionRef.current !== gesture.startSectionId ||
      (
        gesture.startSectionId === "featured-projects" &&
        activeFeaturedProjectIndexRef.current !== gesture.startProjectIndex
      );

    /*
     * The native-scroll fallback may have claimed the boundary first. Once
     * that happens, suppress the rest of the same physical touch so native
     * momentum cannot overwrite the already-running GSAP transition.
     */
    if (
      navigationChanged &&
      (runtime.activeTween || runtime.isProgrammaticScroll)
    ) {
      event.preventDefault();
      gesture.consumed = true;
      return;
    }

    if (navigationChanged) return;

    const boundary = coordination.featured.getContentBoundary(
      HOME_SCROLL_DIRECTIONS.UP,
      { deferStateCommit: true },
    );
    if (!boundary) return;

    if (!shouldClaimTouchUpBoundary({
      boundaryScrollTop: boundary.scrollTop,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startScrollTop: gesture.startScrollTop,
      startX: gesture.startX,
      startY: gesture.startY,
    })) {
      return;
    }

    /*
     * Native scrolling remains untouched inside the project. Only the part of
     * the same gesture that would cross the upward boundary is claimed. This
     * stops iOS/Android from continuing to write scrollTop over the GSAP tween.
     */
    event.preventDefault();
    gesture.consumed = true;

    coordination.featured.claimMobileTouchBoundary(
      HOME_SCROLL_DIRECTIONS.UP,
    );
  };

  const clearBoundaryTouchGesture = () => {
    upwardBoundaryTouch = null;
  };

  const handlePointerDown = (event) => {
    if (
      event.pointerType !== "touch" ||
      !event.isPrimary ||
      touchGesture
    ) {
      return;
    }

    const featuredProjectActive =
      runtime.contentMode &&
      activeSectionRef.current === "featured-projects";
    const featuredExpansionEnabled =
      featuredProjectActive && coordination.featured.isExpansionEnabled();
    const featuredProjectReady =
      featuredProjectActive && (!reduceMotion || !featuredExpansionEnabled);
    const gestureOwner = getTouchGestureOwner({
      contentMode: runtime.contentMode,
      featuredProjectReady,
      featuredExpansionEnabled,
      interactiveTarget: isInteractiveTarget(event.target),
      nativeHorizontalTarget: isNativeHorizontalTarget(event.target),
    });

    if (gestureOwner !== TOUCH_GESTURE_OWNERS.CONTROLLED_VERTICAL) return;

    if (featuredProjectReady) {
      const projectPanels = coordination.featured.getProjectPanels();
      const projectIndex = activeFeaturedProjectIndexRef.current;
      const bounds = coordination.featured.getPanelScrollBounds(projectPanels[projectIndex]);
      const imageProject = coordination.featured.isImageProject(
        projectIndex,
        projectPanels,
      );
      touchGesture = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startScrollTop: scroller.scrollTop,
        featuredProject: true,
        featuredBounds: bounds,
        featuredBoundaryAtStart: bounds
          ? {
              down:
                scroller.scrollTop >=
                bounds.end - FEATURED_PROJECT_EDGE_TOLERANCE_PX,
              up:
                scroller.scrollTop <=
                bounds.start + FEATURED_PROJECT_EDGE_TOLERANCE_PX,
            }
          : { down: false, up: false },
        featuredExpansion: featuredExpansionEnabled && imageProject && bounds
          ? {
              boundaryScrollTop: bounds.end,
              distanceToEnd: Math.max(0, bounds.end - scroller.scrollTop),
              projectIndex,
              startProgress: coordination.featured.getExpansionProgress(projectIndex),
            }
          : null,
        captured: false,
      };
      return;
    }

    if (runtime.contentMode) {
      return;
    }

    const isStatementGesture =
      navigationStateRef.current.panelIndex === STATEMENT_PANEL_INDEX;
    touchGesture = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startProgress: isStatementGesture ? statement.getProgress() : 0,
      statement: isStatementGesture,
      captured: false,
      consumed: false,
    };
  };

  const handlePointerMove = (event) => {
    if (
      !touchGesture ||
      touchGesture.pointerId !== event.pointerId ||
      touchGesture.consumed
    ) return;
    const horizontalDistance = event.clientX - touchGesture.startX;
    const verticalDistance = touchGesture.startY - event.clientY;
    if (touchGesture.featuredProject) {
      const expansion = touchGesture.featuredExpansion;
      const absoluteVerticalDistance = Math.abs(verticalDistance);
      const isVerticalGesture =
        absoluteVerticalDistance >= Math.abs(horizontalDistance) * TOUCH_VERTICAL_DOMINANCE;
      if (!isVerticalGesture) return;
      if (
        !touchGesture.captured &&
        absoluteVerticalDistance < FEATURED_TOUCH_SWIPE_THRESHOLD_PX
      ) return;

      event.preventDefault();
      touchGesture.captured = true;
      if (expansion) {
        const expands =
          verticalDistance > 0 &&
          expansion.startProgress < 1 &&
          verticalDistance + FEATURED_PROJECT_EDGE_TOLERANCE_PX >= expansion.distanceToEnd;
        const contracts = verticalDistance < 0 && expansion.startProgress > 0;
        if (expands || contracts) {
          scroller.scrollTop = expansion.boundaryScrollTop;
          const nativeDistance = expands ? expansion.distanceToEnd : 0;
          coordination.featured.setExpansionProgress(
            expansion.projectIndex,
            advanceFeaturedExpansionProgress(
              expansion.startProgress,
              verticalDistance - nativeDistance,
              scroller.clientHeight,
            ),
          );
          return;
        }
      }

      const direction = getSwipeDirection(
        {
          startX: touchGesture.startX,
          startY: touchGesture.startY,
          endX: event.clientX,
          endY: event.clientY,
        },
        { threshold: FEATURED_TOUCH_SWIPE_THRESHOLD_PX, verticalDominance: TOUCH_VERTICAL_DOMINANCE },
      );
      if (direction === null) return;

      const bounds = touchGesture.featuredBounds;
      const startedAtBoundary = direction > 0
        ? touchGesture.featuredBoundaryAtStart?.down
        : touchGesture.featuredBoundaryAtStart?.up;

      if (bounds) {
        const projectedScrollTop =
          touchGesture.startScrollTop + verticalDistance;
        const boundaryScrollTop =
          direction > 0 ? bounds.end : bounds.start;
        const boundaryOvershoot =
          direction > 0
            ? projectedScrollTop - bounds.end
            : bounds.start - projectedScrollTop;
        const reachedBoundaryDuringGesture =
          boundaryOvershoot >= FEATURED_TOUCH_SWIPE_THRESHOLD_PX;

        /*
         * Mobile/tablet: un solo gesto debe poder recorrer el contenido
         * restante del proyecto y, si continúa más allá del borde,
         * ejecutar la transición. Antes solo se permitía la transición
         * cuando el gesto había comenzado exactamente en el límite, lo
         * que dejaba el scroll "pegado" al llegar al final.
         */
        if (startedAtBoundary || reachedBoundaryDuringGesture) {
          if (
            Math.abs(scroller.scrollTop - boundaryScrollTop) >
            FEATURED_PROJECT_EDGE_TOLERANCE_PX
          ) {
            scroller.scrollTop = boundaryScrollTop;
            coordination.content.synchronizeContentScroll();
          }

          if (coordination.featured.transitionProject(direction, 0)) {
            touchGesture.consumed = true;
            return;
          }

          const boundary =
            coordination.featured.getContentBoundary(direction);

          if (boundary && boundary.transition()) {
            touchGesture.consumed = true;
            return;
          }
        }

        scroller.scrollTop = Math.min(
          Math.max(projectedScrollTop, bounds.start),
          bounds.end,
        );
        coordination.content.synchronizeContentScroll();
      }
      return;
    }

    if (touchGesture.statement && !runtime.activeTween) {
      const absoluteVerticalDistance = Math.abs(verticalDistance);
      const isVerticalGesture =
        absoluteVerticalDistance >= Math.abs(horizontalDistance) * TOUCH_VERTICAL_DOMINANCE;
      if (!isVerticalGesture) return;
      if (!touchGesture.captured && absoluteVerticalDistance < TOUCH_SWIPE_THRESHOLD_PX) return;

      event.preventDefault();
      touchGesture.captured = true;
      if (
        statement.isAutoRevealing() &&
        navigationStateRef.current.panelIndex === STATEMENT_PANEL_INDEX
      ) {
        touchGesture.consumed = true;
        return;
      }
      statement.stopAnimation();
      if (
        touchGesture.startProgress <= 0 &&
        !runtime.statementEnteringUp &&
        verticalDistance < -TOUCH_SWIPE_THRESHOLD_PX
      ) {
        touchGesture.consumed = true;
        coordination.panel.moveByDirection(HOME_SCROLL_DIRECTIONS.UP);
        return;
      }
      if (
        touchGesture.startProgress >= 1 &&
        verticalDistance > TOUCH_SWIPE_THRESHOLD_PX
      ) {
        touchGesture.consumed = true;
        coordination.content.navigateSection("services");
        return;
      }
      if (
        touchGesture.startProgress >= 1 &&
        verticalDistance < -TOUCH_SWIPE_THRESHOLD_PX &&
        window.matchMedia?.("(max-width: 1023px)").matches
      ) {
        touchGesture.consumed = true;
        runtime.wheelTransitionLock = true;
        statement.startAutoReverse(() => {
          coordination.panel.moveByDirection(HOME_SCROLL_DIRECTIONS.UP);
        });
        runtime.statementEnteringUp = false;
        return;
      }

      statement.commitProgress(advanceHomeStatementProgress(
        touchGesture.startProgress,
        runtime.statementEnteringUp ? Math.abs(verticalDistance) : verticalDistance,
        scroller.clientHeight,
        reduceMotion,
      ));
      return;
    }

    const direction = getSwipeDirection(
      {
        startX: touchGesture.startX,
        startY: touchGesture.startY,
        endX: event.clientX,
        endY: event.clientY,
      },
      { threshold: TOUCH_SWIPE_THRESHOLD_PX, verticalDominance: TOUCH_VERTICAL_DOMINANCE },
    );
    if (direction === null) return;
    event.preventDefault();
    touchGesture.consumed = true;
    coordination.panel.moveByDirection(direction);
  };

  const clearTouchGesture = (event) => {
    touchGesture = clearTouchGestureForPointer(
      touchGesture,
      event.pointerId,
    );
  };

  const handleNativeTouchStart = () => {
    coordination.featured.beginMobileTouchGesture?.();
  };

  const handleNativeTouchEnd = () => {
    coordination.featured.endMobileTouchGesture?.();
  };

  const resetTouchGesture = () => {
    touchGesture = null;
    upwardBoundaryTouch = null;
  };

  const handleVisibilityChange = () => {
    if (document.hidden) resetTouchGesture();
  };

  const handleKeyDown = (event) => {
    const direction = getKeyboardDirection(event);
    if (direction === null || isInteractiveTarget(event.target)) return;
    if (runtime.activeTween || runtime.isProgrammaticScroll) {
      event.preventDefault();
      return;
    }
    if (runtime.contentMode) {
      const keyboardTravelDistance =
        event.key === "PageDown" || event.key === "PageUp" || event.key === " "
          ? direction * scroller.clientHeight
          : direction * 40;
      if (
        activeSectionRef.current === "featured-projects" &&
        coordination.featured.handleExpansionInput(event, keyboardTravelDistance, direction)
      ) return;
      if (
        activeSectionRef.current === "featured-projects" &&
        coordination.featured.getProjectTransition(direction, keyboardTravelDistance)
      ) {
        event.preventDefault();
        if (!event.repeat) {
          coordination.featured.transitionProject(direction, keyboardTravelDistance);
        }
      }
      return;
    }

    event.preventDefault();
    if (event.repeat) return;
    const currentState = navigationStateRef.current;
    if (
      statement.isAutoRevealing() &&
      currentState.panelIndex === STATEMENT_PANEL_INDEX
    ) {
      return;
    }
    if (currentState.panelIndex === STATEMENT_PANEL_INDEX && !runtime.activeTween) {
      const currentProgress = statement.getProgress();
      if (
        currentProgress <= 0 &&
        direction === HOME_SCROLL_DIRECTIONS.UP &&
        !runtime.statementEnteringUp
      ) {
        coordination.panel.moveByDirection(direction);
        return;
      }
      if (currentProgress >= 1 && direction === HOME_SCROLL_DIRECTIONS.DOWN) {
        coordination.content.navigateSection("services");
        return;
      }
      if (
        direction === HOME_SCROLL_DIRECTIONS.UP &&
        currentProgress >= 1 &&
        window.matchMedia?.("(max-width: 1023px)").matches
      ) {
        runtime.wheelTransitionLock = true;
        statement.startAutoReverse(() => {
          coordination.panel.moveByDirection(HOME_SCROLL_DIRECTIONS.UP);
        });
        runtime.statementEnteringUp = false;
        return;
      }
      statement.animateTo(
        runtime.statementEnteringUp || direction === HOME_SCROLL_DIRECTIONS.DOWN ? 1 : 0,
      );
      runtime.statementEnteringUp = false;
      return;
    }
    coordination.panel.moveByDirection(direction);
  };

  const attach = () => {
    scroller.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    scroller.addEventListener("touchstart", handleBoundaryTouchStart, {
      passive: true,
      capture: true,
    });
    scroller.addEventListener("touchmove", handleBoundaryTouchMove, {
      passive: false,
      capture: true,
    });
    scroller.addEventListener("touchend", clearBoundaryTouchGesture, true);
    scroller.addEventListener("touchcancel", clearBoundaryTouchGesture, true);
    scroller.addEventListener("pointerdown", handlePointerDown, true);
    scroller.addEventListener("pointermove", handlePointerMove, {
      passive: false,
      capture: true,
    });
    scroller.addEventListener("pointerup", clearTouchGesture);
    scroller.addEventListener("pointercancel", clearTouchGesture);
    scroller.addEventListener("touchstart", handleNativeTouchStart, { passive: true });
    scroller.addEventListener("touchend", handleNativeTouchEnd, { passive: true });
    scroller.addEventListener("touchcancel", handleNativeTouchEnd, { passive: true });
    scroller.addEventListener("lostpointercapture", resetTouchGesture);
    window.addEventListener("blur", resetTouchGesture);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    scroller.addEventListener("keydown", handleKeyDown);
    scroller.addEventListener("scroll", coordination.content.handleNativeScroll, { passive: true });
    document.addEventListener(
      "mousedown",
      handleScrollbarMouseDown,
      true,
    );

    window.addEventListener(
      "mouseup",
      handleScrollbarMouseUp,
      true,
    );
    if (runtime.supportsScrollEnd) {
      scroller.addEventListener("scrollend", coordination.content.handleScrollEnd);
    }
    window.addEventListener("resize", coordination.content.handleResize);
    window.addEventListener("orientationchange", coordination.content.handleResize);
    window.visualViewport?.addEventListener(
      "resize",
      coordination.content.handleResize,
      { passive: true },
    );
  };

  const destroy = () => {
    window.clearTimeout(runtime.wheelIdleTimer);
    touchGesture = null;
    upwardBoundaryTouch = null;
    scroller.removeEventListener("wheel", handleWheel, true);
    scroller.removeEventListener("touchstart", handleBoundaryTouchStart, true);
    scroller.removeEventListener("touchmove", handleBoundaryTouchMove, true);
    scroller.removeEventListener("touchend", clearBoundaryTouchGesture, true);
    scroller.removeEventListener("touchcancel", clearBoundaryTouchGesture, true);
    scroller.removeEventListener("pointerdown", handlePointerDown, true);
    scroller.removeEventListener("pointermove", handlePointerMove, true);
    scroller.removeEventListener("pointerup", clearTouchGesture);
    scroller.removeEventListener("pointercancel", clearTouchGesture);
    scroller.removeEventListener("touchstart", handleNativeTouchStart);
    scroller.removeEventListener("touchend", handleNativeTouchEnd);
    scroller.removeEventListener("touchcancel", handleNativeTouchEnd);
    scroller.removeEventListener("lostpointercapture", resetTouchGesture);
    window.removeEventListener("blur", resetTouchGesture);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    scroller.removeEventListener("keydown", handleKeyDown);
    scroller.removeEventListener("scroll", coordination.content.handleNativeScroll);
    if (runtime.supportsScrollEnd) {
      scroller.removeEventListener("scrollend", coordination.content.handleScrollEnd);
    }
    window.removeEventListener("resize", coordination.content.handleResize);
    window.removeEventListener("orientationchange", coordination.content.handleResize);
    window.visualViewport?.removeEventListener(
      "resize",
      coordination.content.handleResize,
    );
    document.removeEventListener(
      "mousedown",
      handleScrollbarMouseDown,
      true,
    );

    window.removeEventListener(
      "mouseup",
      handleScrollbarMouseUp,
      true,
    );
  };
  const handleScrollbarMouseDown = (event) => {
  if (event.button !== 0) return;

    const rect = scroller.getBoundingClientRect();

    const nativeScrollbarWidth =
      scroller.offsetWidth - scroller.clientWidth;

    const detectionWidth = Math.max(
      nativeScrollbarWidth,
      12,
    );

    const insideScroller =
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    const overVerticalScrollbar =
      event.clientX >= rect.right - detectionWidth &&
      event.clientX <= rect.right;

    if (!insideScroller || !overVerticalScrollbar) return;

    coordination.content.beginScrollbarDrag();
  };

  const handleScrollbarMouseUp = () => {
    coordination.content.endScrollbarDrag();
  };
  return {
    attach,
    destroy,
    observeConsumedWheelGesture,
    releaseWheelTransitionLock,
    requireFreshWheelGesture,
    scheduleWheelGestureSettlement,
  };
}

export {
  createInputGestureController,
  isInteractiveTarget,
  shouldClaimTouchUpBoundary,
};
