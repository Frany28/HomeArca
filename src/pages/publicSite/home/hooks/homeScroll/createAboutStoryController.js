import { gsap } from "gsap";

import {
  consumeWheelGesture,
} from "../../utils/homeScrollNavigation.js";

const ABOUT_EDGE_TOLERANCE_PX = 2;
const ABOUT_TRAVEL_VIEWPORT_RATIO = 5;
const ABOUT_MIN_TRAVEL_PX = 2600;
const ABOUT_CREDITS_START_PROGRESS = 0.20;
const ABOUT_CREDITS_END_PROGRESS = 0.80;
const ABOUT_CREDITS_SCROLL_SCALE = 0.45;

function clamp(value) {
  return Math.min(Math.max(value, 0), 1);
}

function createAboutStoryController({
  coordination,
  progress,
  reduceMotion,
  runtime,
  scroller,
}) {
  let targetProgress = progress.get();
  let progressTween = null;
  let endpointLock = null;
  let gestureIdle = true;

  const getStory = () => {
    const usesStaticResponsiveStory =
      typeof window !== "undefined" &&
      (window.matchMedia?.("(max-width: 1024px)").matches ?? false);

    if (usesStaticResponsiveStory) return null;

    return scroller.querySelector("[data-about-story]");
  };

  const getStoryAnchor = () => {
    const story = getStory();

    if (!story) return null;

    const viewportRect = scroller.getBoundingClientRect();
    const storyRect = story.getBoundingClientRect();

    return (
      scroller.scrollTop +
      storyRect.top -
      viewportRect.top
    );
  };

  const getTravelDistance = () =>
    Math.max(
      scroller.clientHeight * ABOUT_TRAVEL_VIEWPORT_RATIO,
      ABOUT_MIN_TRAVEL_PX,
    );

  const getProgress = () => progress.get();

  const setProgress = (nextProgress) => {
    progressTween?.kill();
    progressTween = null;

    targetProgress = clamp(nextProgress);
    progress.set(targetProgress);
  };

  const smoothTo = (nextProgress) => {
    const current = progress.get();
    const target = clamp(nextProgress);

    targetProgress = target;

    progressTween?.kill();
    progressTween = null;

    if (
      reduceMotion ||
      Math.abs(target - current) < 0.0001
    ) {
      progress.set(target);

      if (target === 0 || target === 1) {
        endpointLock = target;

        if (gestureIdle) {
          endpointLock = null;
        }
      }

      return;
    }

    const proxy = {
      value: current,
    };

    progressTween = gsap.to(proxy, {
      value: target,
      duration: Math.min(
        0.32,
        Math.max(
          0.08,
          Math.abs(target - current) * 0.5,
        ),
      ),
      ease: "power1.out",

      onUpdate: () => {
        progress.set(clamp(proxy.value));
      },

      onComplete: () => {
        progress.set(target);
        progressTween = null;

        if (target === 0 || target === 1) {
          endpointLock = target;

          if (gestureIdle) {
            endpointLock = null;
          }
        }
      },
    });
  };

  const settleGesture = () => {
    gestureIdle = true;

    if (!progressTween) {
      endpointLock = null;
    }
  };

  const handleInput = (
    event,
    deltaY,
    direction,
    { smooth = true } = {},
  ) => {
    const anchor = getStoryAnchor();

    if (
      anchor === null ||
      !direction ||
      !Number.isFinite(deltaY)
    ) {
      return false;
    }

    const current = getProgress();
    const magnitude = Math.abs(deltaY);

    /*
     * Evita que la inercia del mismo gesto abandone
     * About justo cuando llega a 0 o 1.
     */
    if (
      endpointLock === 1 &&
      direction > 0 &&
      current >= 1
    ) {
      event.preventDefault();
      event.stopPropagation?.();

      coordination.input.scheduleWheelGestureSettlement();

      return true;
    }

    if (
      endpointLock === 0 &&
      direction < 0 &&
      current <= 0
    ) {
      event.preventDefault();
      event.stopPropagation?.();

      coordination.input.scheduleWheelGestureSettlement();

      return true;
    }

    /*
     * Si cambia de dirección, puede recorrer la
     * animación inmediatamente al revés.
     */
    if (
      (endpointLock === 1 && direction < 0) ||
      (endpointLock === 0 && direction > 0)
    ) {
      endpointLock = null;
    }

    const distanceToAnchor =
      direction > 0
        ? Math.max(0, anchor - scroller.scrollTop)
        : Math.max(0, scroller.scrollTop - anchor);

    const reachesAnchor =
      distanceToAnchor <=
      magnitude + ABOUT_EDGE_TOLERANCE_PX;

    const storyIsRunning =
      current > 0 && current < 1;

    const shouldAdvance =
      direction > 0 &&
      current < 1 &&
      (storyIsRunning || reachesAnchor);

    const shouldReverse =
      direction < 0 &&
      current > 0 &&
      (storyIsRunning || reachesAnchor);

    if (!shouldAdvance && !shouldReverse) {
      return false;
    }

    event.preventDefault();
    event.stopPropagation?.();

    gestureIdle = false;

    /*
     * Fija físicamente la página en el inicio de
     * la imagen durante toda la narrativa.
     */
    if (
      Math.abs(scroller.scrollTop - anchor) >
      ABOUT_EDGE_TOLERANCE_PX
    ) {
      scroller.scrollTop = anchor;
      coordination.content.synchronizeContentScroll();
    }

    const nativeDistance =
      reachesAnchor &&
      distanceToAnchor > ABOUT_EDGE_TOLERANCE_PX
        ? distanceToAnchor
        : 0;

    const scrubDistance = Math.max(
      0,
      magnitude - nativeDistance,
    );

    if (scrubDistance > 0) {
  const signedDistance =
    direction * scrubDistance;

  /*
   * Durante el recorrido de los créditos
   * reducimos la fuerza del wheel/trackpad.
   *
   * Antes y después de los créditos,
   * About mantiene su velocidad normal.
   */
  const creditsAreActive =
    targetProgress >=
      ABOUT_CREDITS_START_PROGRESS &&
    targetProgress <=
      ABOUT_CREDITS_END_PROGRESS;

  const effectiveDistance =
    creditsAreActive
      ? signedDistance *
        ABOUT_CREDITS_SCROLL_SCALE
      : signedDistance;

  const nextProgress = clamp(
    targetProgress +
      effectiveDistance /
        getTravelDistance(),
  );

  if (smooth) {
    smoothTo(nextProgress);
  } else {
    setProgress(nextProgress);
  }

  if (
    nextProgress <= 0 ||
    nextProgress >= 1
  ) {
    runtime.wheelGestureState =
      consumeWheelGesture(
        runtime.wheelGestureState,
        direction * magnitude,
        event.timeStamp,
      );
  }
}

    coordination.input.scheduleWheelGestureSettlement();

    return true;
  };

  const pinStory = () => {
    const anchor = getStoryAnchor();

    if (anchor === null) return false;

    const current = getProgress();

    const shouldPin =
      (current > 0 && current < 1) ||
      endpointLock !== null;

    if (!shouldPin) return false;

    if (
      Math.abs(scroller.scrollTop - anchor) >
      ABOUT_EDGE_TOLERANCE_PX
    ) {
      scroller.scrollTop = anchor;
    }

    return true;
  };

  const synchronizeForExternalNavigation = () => {
    const anchor = getStoryAnchor();

    if (anchor === null) return false;

    const scrollTop = scroller.scrollTop;
    let nextProgress = null;

    if (
      scrollTop <
      anchor - ABOUT_EDGE_TOLERANCE_PX
    ) {
      nextProgress = 0;
    } else if (
      scrollTop >
      anchor + ABOUT_EDGE_TOLERANCE_PX
    ) {
      nextProgress = 1;
    }

    if (nextProgress === null) return false;

    /*
     * Navbar, hash and scrollbar navigation can bypass the controlled About
     * narrative entirely. Once that external movement finishes, progress must
     * describe the physical side of the story we landed on:
     *
     *   before About story -> 0
     *   after About story  -> 1
     *
     * Clear transient gesture state as well, otherwise an endpoint lock or a
     * tween from a previous visit can make the reverse story intermittently
     * fail when returning from Contact.
     */
    gestureIdle = true;
    endpointLock = null;
    setProgress(nextProgress);

    return true;
  };

  const destroy = () => {
    progressTween?.kill();
    progressTween = null;
  };

  return {
    destroy,
    handleInput,
    pinStory,
    settleGesture,
    synchronizeForExternalNavigation,
  };
}

export { createAboutStoryController };  