import { gsap } from "gsap";

import {
  advanceFeaturedExpansionProgress,
  advanceWheelGesture,
  consumeWheelGesture,
} from "../../utils/homeScrollNavigation.js";
import {
  FEATURED_EXPANSION_SMOOTH_MAX_SECONDS,
  FEATURED_EXPANSION_SMOOTH_MIN_SECONDS,
  FEATURED_IMAGE_GALLERY_SELECTOR,
  FEATURED_PROJECT_EDGE_TOLERANCE_PX,
  FEATURED_PROJECT_SELECTOR,
  WHEEL_GESTURE_THRESHOLD_PX,
} from "./homeScrollConstants.js";

function createFeaturedProjectsController({
  activeFeaturedProjectIndexRef,
  activeSectionRef,
  coordination,
  expansionProgress,
  preparationOffsets,
  reduceMotion,
  runtime,
  scroller,
  setActiveFeaturedProjectIndex,
}) {
  let expansionCompletionLock = null;
  let expansionGeneration = 0;
  let processReturnGestureLocked = false;
  let processReturnGestureBecameIdle = false;
    const expansionTweens = new Map();
    const expansionTargets = expansionProgress.map((progress) => progress.get());
    const beginProcessReturnGestureLock = () => {
    processReturnGestureLocked = true;
    processReturnGestureBecameIdle = false;
  };

  const settleProcessReturnGesture = () => {
    if (!processReturnGestureLocked) return;

    processReturnGestureBecameIdle = true;

    if (!runtime.activeTween && !runtime.isProgrammaticScroll) {
      processReturnGestureLocked = false;
    }
  };

  const completeProcessReturnGesture = () => {
    if (processReturnGestureBecameIdle) {
      processReturnGestureLocked = false;
    }
  };

  const isProcessReturnGestureLocked = () =>
    processReturnGestureLocked;
  const getSection = () => coordination.content.getSection("featured-projects");
  const getProjectPanels = (section = getSection()) =>
    section ? [...section.querySelectorAll(FEATURED_PROJECT_SELECTOR)] : [];
  const isImageProject = (index, projectPanels = getProjectPanels()) =>
    Boolean(projectPanels[index]?.querySelector?.(FEATURED_IMAGE_GALLERY_SELECTOR));
  const isExpansionEnabled = () =>
    !(typeof window !== "undefined" &&
      window.matchMedia?.("(max-width: 1023px)").matches);
  const getExpansionProgress = (index) => expansionProgress[index]?.get() ?? 0;
  const getExpansionTarget = (index) => expansionTargets[index] ?? 0;

  const commitProjectIndex = (index) => {
    if (activeFeaturedProjectIndexRef.current === index) return;
    activeFeaturedProjectIndexRef.current = index;
    setActiveFeaturedProjectIndex(index);
  };

  const setExpansionProgress = (index, progress) => {
    expansionTweens.get(index)?.kill();
    expansionTweens.delete(index);
    expansionTargets[index] = progress;
    expansionProgress[index]?.set(progress);
  };

  const smoothExpansionProgress = (index, nextProgress) => {
    const renderedProgress = getExpansionProgress(index);
    const targetProgress = Math.min(Math.max(nextProgress, 0), 1);
    const distance = Math.abs(targetProgress - renderedProgress);

    expansionTargets[index] = targetProgress;
    expansionTweens.get(index)?.kill();
    expansionTweens.delete(index);

    if (reduceMotion || distance <= 0.0001) {
      expansionProgress[index]?.set(targetProgress);
      if (targetProgress >= 1) expansionCompletionLock = index;
      return;
    }

    const progressProxy = { value: renderedProgress };
    const duration = Math.min(
      FEATURED_EXPANSION_SMOOTH_MAX_SECONDS,
      Math.max(FEATURED_EXPANSION_SMOOTH_MIN_SECONDS, distance * 0.75),
    );
    const tweenGeneration = expansionGeneration;
    const tween = gsap.to(progressProxy, {
      value: targetProgress,
      duration,
      ease: "power1.out",
      overwrite: true,
      onUpdate: () => {
        if (expansionGeneration !== tweenGeneration) return;
        expansionProgress[index]?.set(
          Math.min(Math.max(progressProxy.value, 0), 1),
        );
      },
      onComplete: () => {
        if (expansionGeneration !== tweenGeneration) return;
        expansionProgress[index]?.set(targetProgress);
        if (expansionTargets[index] === targetProgress) {
          if (targetProgress >= 1) expansionCompletionLock = index;
          expansionTweens.delete(index);
        }
      },
    });
    expansionTweens.set(index, tween);
  };

  const setPreparationOffset = (index, offset) => {
    preparationOffsets[index]?.set(offset);
  };

  const cancelExpansionTweens = () => {
    expansionGeneration += 1;
    expansionTweens.forEach((tween) => tween.kill());
    expansionTweens.clear();
  };

  const resetExpansionProgress = () => {
    cancelExpansionTweens();
    expansionCompletionLock = null;
    expansionProgress.forEach((_, index) => setExpansionProgress(index, 0));
  };

  const resetNavigationState = () => {
    resetExpansionProgress();
    preparationOffsets.forEach((_, index) => setPreparationOffset(index, 0));
    commitProjectIndex(0);
  };

  const getElementScrollTop = (element) => {
    const viewportRect = scroller.getBoundingClientRect();
    return scroller.scrollTop + element.getBoundingClientRect().top - viewportRect.top;
  };

  const getPanelScrollBounds = (element) => {
    if (!element) return null;
    const panelTop = getElementScrollTop(element);
    const elementRect = element.getBoundingClientRect();
    const panelHeight = element.offsetHeight ??
      Math.max(0, elementRect.bottom - elementRect.top);
    return {
      start: panelTop,
      end: panelTop + Math.max(0, panelHeight - scroller.clientHeight),
    };
  };

  const getProjectTransition = (direction, travelDistance = 0) => {
    if (activeSectionRef.current !== "featured-projects" || !direction) return null;
    const projectPanels = getProjectPanels();
    const currentIndex = activeFeaturedProjectIndexRef.current;
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= projectPanels.length) return null;

    const currentExpansionProgress = getExpansionProgress(currentIndex);
    if (
      isExpansionEnabled() &&
      isImageProject(currentIndex, projectPanels) &&
      ((direction > 0 && currentExpansionProgress < 1) ||
        (direction < 0 && currentExpansionProgress > 0))
    ) {
      return null;
    }

    const expansionEnabled = isExpansionEnabled();
    let reachedEdge = false;

    if (!expansionEnabled) {
      const bounds = getPanelScrollBounds(projectPanels[currentIndex]);
      if (!bounds) return null;

      reachedEdge = direction > 0
        ? scroller.scrollTop >= bounds.end - FEATURED_PROJECT_EDGE_TOLERANCE_PX
        : scroller.scrollTop <= bounds.start + FEATURED_PROJECT_EDGE_TOLERANCE_PX;
    } else {
      const viewportRect = scroller.getBoundingClientRect();
      const currentRect = projectPanels[currentIndex].getBoundingClientRect();
      const projectedDistance = Math.max(0, direction * travelDistance);

      reachedEdge = direction > 0
        ? currentRect.bottom <= viewportRect.bottom +
          FEATURED_PROJECT_EDGE_TOLERANCE_PX + projectedDistance
        : currentRect.top >= viewportRect.top -
          FEATURED_PROJECT_EDGE_TOLERANCE_PX - projectedDistance;
    }

    if (!reachedEdge) return null;

    const nextPanel = projectPanels[nextIndex];
    const nextPanelTop = getElementScrollTop(nextPanel);
    return {
      index: nextIndex,
      scrollTop: direction > 0
        ? nextPanelTop
        : nextPanelTop + Math.max(0, nextPanel.offsetHeight - scroller.clientHeight),
    };
  };

  const synchronizeProject = (section = getSection()) => {
    const projectPanels = getProjectPanels(section);
    if (!projectPanels.length || runtime.activeTween || runtime.isProgrammaticScroll) return;

    const scrollTop = scroller.scrollTop;
    const viewportHeight = scroller.clientHeight;
    let closestIndex = activeFeaturedProjectIndexRef.current;
    let closestDistance = Number.POSITIVE_INFINITY;

    projectPanels.forEach((panel, index) => {
      const panelTop = getElementScrollTop(panel);
      const panelBottom = panelTop + panel.offsetHeight;
      const panelEnd = Math.max(panelTop, panelBottom - viewportHeight);

      if (
        scrollTop >= panelTop - FEATURED_PROJECT_EDGE_TOLERANCE_PX &&
        scrollTop <= panelEnd + FEATURED_PROJECT_EDGE_TOLERANCE_PX
      ) {
        const distance = Math.abs(scrollTop - panelTop);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      }
    });

    if (closestDistance !== Number.POSITIVE_INFINITY) {
      commitProjectIndex(closestIndex);
    }
  };

  const transitionProject = (direction, travelDistance = 0) => {
    if (runtime.activeTween || runtime.isProgrammaticScroll) return false;
    const transition = getProjectTransition(direction, travelDistance);
    if (!transition) return false;

    expansionCompletionLock = null;
    if (direction < 0) {
      if (isExpansionEnabled() && isImageProject(transition.index)) {
        setPreparationOffset(
          transition.index,
          scroller.scrollTop - transition.scrollTop,
        );
        setExpansionProgress(transition.index, 1);
      }
      commitProjectIndex(transition.index);
    }

    return coordination.panel.startScrollTransition({
      scrollTop: transition.scrollTop,
      onComplete: () => {
        if (direction > 0) commitProjectIndex(transition.index);
        if (direction < 0) setPreparationOffset(transition.index, 0);
        coordination.content.synchronizeContentScroll();
      },
    });
  };

  const transitionBetweenSections = (
    targetSectionId,
    { featuredProjectIndex = null, targetAlignment = "start" } = {},
  ) => {
    if (runtime.activeTween || runtime.isProgrammaticScroll) return false;
    const target = coordination.content.getSection(targetSectionId);
    if (!target) return false;

    const entersQuintaFromServices =
      activeSectionRef.current === "services" &&
      targetSectionId === "featured-projects" &&
      featuredProjectIndex === 0 &&
      targetAlignment === "start";
    const entersAptoFromProcess =
      activeSectionRef.current === "process" &&
      targetSectionId === "featured-projects" &&
      featuredProjectIndex !== null &&
      targetAlignment === "end";
    if (entersAptoFromProcess) {
      beginProcessReturnGestureLock();
    }
    if (entersQuintaFromServices) {
      expansionCompletionLock = null;
      setPreparationOffset(0, 0);
      setExpansionProgress(0, 0);
      commitProjectIndex(0);
    }

    let targetElement = target;
    if (targetSectionId === "featured-projects" && featuredProjectIndex !== null) {
      targetElement = getProjectPanels(target)[featuredProjectIndex] ?? target;
    }
    const targetElementTop = getElementScrollTop(targetElement);
    const targetScrollTop = targetAlignment === "end"
      ? targetElementTop + Math.max(0, targetElement.offsetHeight - scroller.clientHeight)
      : targetElementTop;

    if (
      targetAlignment === "end" &&
      featuredProjectIndex !== null &&
      isExpansionEnabled() &&
      isImageProject(featuredProjectIndex)
    ) {
      setPreparationOffset(
        featuredProjectIndex,
        scroller.scrollTop - targetScrollTop,
      );
      setExpansionProgress(featuredProjectIndex, 1);
    }
    if (featuredProjectIndex !== null) commitProjectIndex(featuredProjectIndex);
    if (entersAptoFromProcess) coordination.content.selectSection(targetSectionId);

    return coordination.panel.startScrollTransition({
      scrollTop: targetScrollTop,
      onComplete: () => {
      coordination.content.selectSection(targetSectionId);

      if (featuredProjectIndex !== null) {
        setPreparationOffset(featuredProjectIndex, 0);
      }

      coordination.content.synchronizeContentScroll();

      if (entersAptoFromProcess) {
        completeProcessReturnGesture();
      }
    },
    });
  };

  const getExpansionAnchor = (
    currentIndex,
    projectPanels = getProjectPanels(),
  ) => getPanelScrollBounds(projectPanels[currentIndex])?.end ?? null;

  const logExpansionGeometry = (
    phase,
    currentIndex,
    progress,
    bounds,
    expansionAnchor,
    projectPanels,
  ) => {
    if (!window.__ARCA_DEBUG_FEATURED_EXPANSION__) return;
    console.debug("[featured-expansion]", {
      bounds,
      currentIndex,
      currentPanelRect: projectPanels[currentIndex]?.getBoundingClientRect(),
      expansionAnchor,
      nextPanelRect: projectPanels[currentIndex + 1]?.getBoundingClientRect(),
      phase,
      progress,
      scrollTop: scroller.scrollTop,
      viewportRect: scroller.getBoundingClientRect(),
    });
  };

  const pinMobileProjectBoundary = () => {
    if (
      activeSectionRef.current !== "featured-projects" ||
      isExpansionEnabled() ||
      runtime.activeTween ||
      runtime.isProgrammaticScroll
    ) {
      return false;
    }

    const projectPanels = getProjectPanels();
    const currentIndex = activeFeaturedProjectIndexRef.current;
    const bounds = getPanelScrollBounds(projectPanels[currentIndex]);

    if (!bounds) return false;

    let pinnedScrollTop = null;

    /*
     * En mobile/tablet el cruce entre proyectos/secciones debe ocurrir
     * únicamente mediante la transición controlada por gesto.
     *
     * Si dejamos libres los bordes exteriores del primer/último proyecto,
     * el scroll nativo puede avanzar unos píxeles antes de que el gesto
     * dispare la transición y deja ver prematuramente la sección vecina.
     *
     * Durante una transición programática esta función ya sale arriba,
     * por lo que fijar ambos límites aquí no interfiere con la animación.
     */
    if (
      scroller.scrollTop <
      bounds.start - FEATURED_PROJECT_EDGE_TOLERANCE_PX
    ) {
      pinnedScrollTop = bounds.start;
    } else if (
      scroller.scrollTop >
      bounds.end + FEATURED_PROJECT_EDGE_TOLERANCE_PX
    ) {
      pinnedScrollTop = bounds.end;
    }

    if (pinnedScrollTop === null) return false;

    scroller.scrollTop = pinnedScrollTop;
    return true;
  };

  const pinExpansion = () => {
    if (reduceMotion || activeSectionRef.current !== "featured-projects") return false;
    const projectPanels = getProjectPanels();
    const currentIndex = activeFeaturedProjectIndexRef.current;
    if (!isExpansionEnabled() || !isImageProject(currentIndex, projectPanels)) return false;

    const expansionAnchor = getExpansionAnchor(currentIndex, projectPanels);
    if (expansionAnchor === null) return false;
    const progress = getExpansionProgress(currentIndex);
    const expansionIsRunning = progress > 0 && progress < 1;
    const expansionHasNotStartedAtBoundary =
      progress <= 0 && scroller.scrollTop >= expansionAnchor;
    const contractionHasNotStartedAtBoundary =
      progress >= 1 && scroller.scrollTop <= expansionAnchor;
    const expansionJustCompleted =
      expansionCompletionLock === currentIndex && progress >= 1;

    if (
      !expansionIsRunning &&
      !expansionHasNotStartedAtBoundary &&
      !contractionHasNotStartedAtBoundary &&
      !expansionJustCompleted
    ) return false;

    if (
      Math.abs(scroller.scrollTop - expansionAnchor) >
      FEATURED_PROJECT_EDGE_TOLERANCE_PX
    ) {
      scroller.scrollTop = expansionAnchor;
    }
    return true;
  };

  const getContentBoundary = (direction) => {
    if (activeSectionRef.current === "process" && direction < 0) {
      const bounds = getPanelScrollBounds(coordination.content.getSection("process"));
      const projectPanels = getProjectPanels();
      const lastProjectIndex = projectPanels.length - 1;
      if (!bounds || lastProjectIndex < 0) return null;
      return {
        scrollTop: bounds.start,
        transition: () => transitionBetweenSections("featured-projects", {
          featuredProjectIndex: lastProjectIndex,
          targetAlignment: "end",
        }),
      };
    }
    if (activeSectionRef.current !== "featured-projects") return null;

    const projectPanels = getProjectPanels();
    const currentIndex = activeFeaturedProjectIndexRef.current;
    const bounds = getPanelScrollBounds(projectPanels[currentIndex]);
    if (!bounds) return null;
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < projectPanels.length) {
      return {
        scrollTop: direction > 0 ? bounds.end : bounds.start,
        transition: () => transitionProject(direction),
      };
    }
    if (direction < 0 && currentIndex === 0) {
      return {
        scrollTop: bounds.start,
        transition: () => transitionBetweenSections("services", { targetAlignment: "end" }),
      };
    }
    if (direction > 0 && currentIndex === projectPanels.length - 1) {
      return {
        scrollTop: bounds.end,
        transition: () => transitionBetweenSections("process"),
      };
    }
    return null;
  };

  const handleExpansionInput = (
    event,
    deltaY,
    direction,
    { smooth = false } = {},
  ) => {
    if (activeSectionRef.current !== "featured-projects") return false;
    const projectPanels = getProjectPanels();
    const currentIndex = activeFeaturedProjectIndexRef.current;
    const bounds = getPanelScrollBounds(projectPanels[currentIndex]);
    const expansionAnchor = getExpansionAnchor(currentIndex, projectPanels);
    if (
      !bounds ||
      expansionAnchor === null ||
      !isExpansionEnabled() ||
      !isImageProject(currentIndex, projectPanels)
    ) return false;

    const progress = getExpansionProgress(currentIndex);
    let targetProgress = getExpansionTarget(currentIndex);
    if (
      !expansionTweens.has(currentIndex) &&
      Math.abs(targetProgress - progress) > 0.0001
    ) {
      targetProgress = progress;
      expansionTargets[currentIndex] = progress;
    }
    if (expansionCompletionLock === currentIndex) {
      expansionCompletionLock = null;
      if (direction > 0 && progress >= 1) return false;
    }
    if (
      (direction > 0 && targetProgress < progress) ||
      (direction < 0 && targetProgress > progress)
    ) targetProgress = progress;

    const distanceToEnd = Math.max(0, expansionAnchor - scroller.scrollTop);
    const magnitude = Math.abs(deltaY);
    const reachesEnd =
      distanceToEnd <= magnitude + FEATURED_PROJECT_EDGE_TOLERANCE_PX;
    const isScrubbing = progress > 0 && progress < 1;
    const expands = direction > 0 && progress < 1 && (isScrubbing || reachesEnd);
    const contracts =
      direction < 0 &&
      progress > 0 &&
      (isScrubbing ||
        scroller.scrollTop >= expansionAnchor - FEATURED_PROJECT_EDGE_TOLERANCE_PX);
    if (!expands && !contracts) return false;

    logExpansionGeometry(
      "wheel-before-pin",
      currentIndex,
      progress,
      bounds,
      expansionAnchor,
      projectPanels,
    );
    event.preventDefault();
    event.stopPropagation?.();
    if (Math.abs(scroller.scrollTop - expansionAnchor) > 0.01) {
      scroller.scrollTop = expansionAnchor;
      coordination.content.synchronizeContentScroll();
    }

    const nativeDistance =
      expands && distanceToEnd > FEATURED_PROJECT_EDGE_TOLERANCE_PX
        ? distanceToEnd
        : 0;
    const scrubDelta = direction * Math.max(0, magnitude - nativeDistance);
    coordination.input.scheduleWheelGestureSettlement();

    let nextProgress = targetProgress;
    if (scrubDelta !== 0) {
      nextProgress = advanceFeaturedExpansionProgress(
        targetProgress,
        scrubDelta,
        scroller.clientHeight,
      );
      if (smooth) smoothExpansionProgress(currentIndex, nextProgress);
      else setExpansionProgress(currentIndex, nextProgress);
    }
    if (nextProgress <= 0 || nextProgress >= 1) {
      runtime.wheelGestureState = consumeWheelGesture(
        runtime.wheelGestureState,
        direction * magnitude,
        event.timeStamp,
      );
    }

    logExpansionGeometry(
      "wheel-after-progress",
      currentIndex,
      getExpansionProgress(currentIndex),
      bounds,
      expansionAnchor,
      projectPanels,
    );
    if (window.__ARCA_DEBUG_FEATURED_EXPANSION__) {
      runtime.requestAnimationFrame(() => {
        logExpansionGeometry(
          "next-animation-frame",
          currentIndex,
          getExpansionProgress(currentIndex),
          bounds,
          expansionAnchor,
          projectPanels,
        );
      });
    }
    return true;
  };

  const handleBoundaryWheel = (event, deltaY, direction) => {
    const boundary = getContentBoundary(direction);
    if (!boundary) {
      coordination.input.observeConsumedWheelGesture(deltaY, event.timeStamp);
      coordination.input.scheduleWheelGestureSettlement();
      return false;
    }

    const distanceToBoundary = Math.max(
      0,
      direction * (boundary.scrollTop - scroller.scrollTop),
    );
    const magnitude = Math.abs(deltaY);
    const reachesBoundary =
      distanceToBoundary <= magnitude + FEATURED_PROJECT_EDGE_TOLERANCE_PX;
    if (!reachesBoundary) {
      coordination.input.observeConsumedWheelGesture(deltaY, event.timeStamp);
      coordination.input.scheduleWheelGestureSettlement();
      return false;
    }

    event.preventDefault();
    event.stopPropagation?.();
    if (Math.abs(scroller.scrollTop - boundary.scrollTop) > 0.01) {
      scroller.scrollTop = boundary.scrollTop;
      coordination.content.synchronizeContentScroll();
    }
    const nativeDistance = distanceToBoundary > FEATURED_PROJECT_EDGE_TOLERANCE_PX
      ? distanceToBoundary
      : 0;
    const intentMagnitude = Math.max(0, magnitude - nativeDistance);
    coordination.input.scheduleWheelGestureSettlement();

    if (intentMagnitude > 0) {
      runtime.wheelGestureState = advanceWheelGesture(
        runtime.wheelGestureState,
        direction * intentMagnitude,
        WHEEL_GESTURE_THRESHOLD_PX,
        event.timeStamp,
      );
    }
    if (
      !runtime.wheelTransitionLock &&
      runtime.wheelGestureState.triggeredDirection !== null
    ) {
      runtime.wheelTransitionLock = true;
      if (!boundary.transition()) runtime.wheelTransitionLock = false;
    }
    return true;
  };

  const prepareForScrollbarNavigation = () => {
    cancelExpansionTweens();

    expansionCompletionLock = null;
    processReturnGestureLocked = false;
    processReturnGestureBecameIdle = false;

    expansionProgress.forEach((_, index) => {
      setExpansionProgress(index, 0);
    });

    preparationOffsets.forEach((_, index) => {
      setPreparationOffset(index, 0);
    });
  };

 return {
  cancelExpansionTweens,
  commitProjectIndex,
  destroy: cancelExpansionTweens,
  getContentBoundary,
  getExpansionProgress,
  getPanelScrollBounds,
  getProjectPanels,
  getProjectTransition,
  handleBoundaryWheel,
  handleExpansionInput,
  isExpansionEnabled,
  isImageProject,
  isProcessReturnGestureLocked,
  pinExpansion,
  pinMobileProjectBoundary,
  prepareForScrollbarNavigation,
  resetNavigationState,
  setExpansionProgress,
  settleProcessReturnGesture,
  synchronizeProject,
  transitionBetweenSections,
  transitionProject,
};
  
}

export { createFeaturedProjectsController };
