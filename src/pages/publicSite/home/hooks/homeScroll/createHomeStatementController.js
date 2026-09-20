import { gsap } from "gsap";

import {
  HOME_SCROLL_DIRECTIONS,
  HOME_SCROLL_PHASES,
  advanceHomeStatementProgress,
  createScrollbarHomeScrollState,
} from "../../utils/homeScrollNavigation.js";

/*
 * Teclado.
 */
const STATEMENT_KEYBOARD_DURATION_SECONDS =
  1.45;

/*
 * Mobile / tablet.
 */
const STATEMENT_AUTO_REVEAL_DURATION_SECONDS =
  2.6;

const STATEMENT_AUTO_REVERSE_DURATION_SECONDS =
  1.35;

/*
 * Wheel / trackpad.
 *
 * El forward sigue siendo suave,
 * pero responde antes que en la versión anterior.
 */
const STATEMENT_FORWARD_SMOOTHING_MS = 125;

/*
 * Volver al video debe ser más rápido.
 */
const STATEMENT_REVERSE_SMOOTHING_MS = 85;

/*
 * Velocidad con la que el wheel modifica
 * el progreso objetivo.
 *
 * No tocamos la calibración global.
 * Esto afecta exclusivamente este efecto.
 */
const STATEMENT_FORWARD_DELTA_MULTIPLIER =
  1.28;

const STATEMENT_REVERSE_DELTA_MULTIPLIER =
  1.3;

/*
 * Finalizamos antes la cola casi invisible.
 */
const STATEMENT_PROGRESS_EPSILON = 0.0015;

/*
 * Evita un salto enorme si el navegador
 * pierde temporalmente un frame.
 */
const STATEMENT_MAX_FRAME_DELTA_MS = 32;

function createHomeStatementController({
  commitNavigationState,
  getNavigationState,
  getViewportHeight,
  isPanelTransitioning,
  panelIndex,
  progress,
  reduceMotion,
}) {
  let wheelInputFrame;
  let scrubFrame;

  let pendingDelta = 0;
  let previousScrubTimestamp = 0;

  let progressTween;

  let wheelScrubbing = false;
  let autoRevealing = false;

  let targetProgress =
    progress.get();

  let scrubDirection = 0;

  const clamp = (value) =>
    Math.min(
      Math.max(value, 0),
      1,
    );

  /*
   * Actualiza tanto el MotionValue como
   * la máquina de estados.
   */
  const commitProgress = (
    nextProgress,
  ) => {
    const safeProgress =
      clamp(nextProgress);

    const currentState =
      getNavigationState();

    progress.set(safeProgress);

    if (
      currentState.panelIndex !==
      panelIndex
    ) {
      return;
    }

    const nextPhase =
      safeProgress <= 0
        ? HOME_SCROLL_PHASES.IMAGE
        : safeProgress >= 1
          ? HOME_SCROLL_PHASES.TITLE
          : HOME_SCROLL_PHASES.EFFECT;

    if (
      currentState.phase === nextPhase
    ) {
      return;
    }

    commitNavigationState({
      panelIndex,

      phase: nextPhase,

      entryDirection:
        nextPhase ===
        HOME_SCROLL_PHASES.IMAGE
          ? HOME_SCROLL_DIRECTIONS.DOWN
          : null,
    });
  };

  const stopScrubLoop = () => {
    if (scrubFrame) {
      window.cancelAnimationFrame(
        scrubFrame,
      );

      scrubFrame = undefined;
    }

    previousScrubTimestamp = 0;
    scrubDirection = 0;
  };

  const stopAnimation = () => {
    progressTween?.kill();

    progressTween = undefined;

    stopScrubLoop();

    targetProgress =
      progress.get();

    pendingDelta = 0;

    autoRevealing = false;
  };

  /*
   * Suavizado independiente del framerate.
   */
  const getSmoothingFactor = (
    deltaTime,
    direction,
  ) => {
    const smoothingTime =
      direction < 0
        ? STATEMENT_REVERSE_SMOOTHING_MS
        : STATEMENT_FORWARD_SMOOTHING_MS;

    return (
      1 -
      Math.exp(
        -deltaTime /
          smoothingTime,
      )
    );
  };

  const runScrub = (
    timestamp,
  ) => {
    if (
      isPanelTransitioning() ||
      getNavigationState().panelIndex !==
        panelIndex
    ) {
      stopScrubLoop();
      return;
    }

    if (
      previousScrubTimestamp === 0
    ) {
      previousScrubTimestamp =
        timestamp;
    }

    const deltaTime =
      Math.min(
        timestamp -
          previousScrubTimestamp,
        STATEMENT_MAX_FRAME_DELTA_MS,
      );

    previousScrubTimestamp =
      timestamp;

    const currentProgress =
      progress.get();

    const difference =
      targetProgress -
      currentProgress;

    /*
     * Determinamos hacia dónde se está
     * moviendo realmente el zoom.
     */
    if (
      Math.abs(difference) >
      STATEMENT_PROGRESS_EPSILON
    ) {
      scrubDirection =
        difference > 0
          ? HOME_SCROLL_DIRECTIONS.DOWN
          : HOME_SCROLL_DIRECTIONS.UP;
    }

    /*
     * Target alcanzado.
     */
    if (
      Math.abs(difference) <=
      STATEMENT_PROGRESS_EPSILON
    ) {
      commitProgress(
        targetProgress,
      );

      scrubFrame = undefined;
      previousScrubTimestamp = 0;
      scrubDirection = 0;

      if (
        targetProgress <= 0 ||
        targetProgress >= 1
      ) {
        wheelScrubbing = false;
      }

      return;
    }

    const smoothing =
      getSmoothingFactor(
        deltaTime,
        scrubDirection,
      );

    /*
     * Interpolación continua.
     */
    const nextProgress =
      currentProgress +
      difference * smoothing;

    commitProgress(
      nextProgress,
    );

    scrubFrame =
      window.requestAnimationFrame(
        runScrub,
      );
  };

  const startScrubLoop = () => {
    if (scrubFrame) {
      return;
    }

    previousScrubTimestamp = 0;

    scrubFrame =
      window.requestAnimationFrame(
        runScrub,
      );
  };

  /*
   * Esta función recibe exclusivamente
   * el delta correspondiente al statement.
   */
  const queueDelta = (
    deltaY,
  ) => {
    pendingDelta += deltaY;

    if (wheelInputFrame) {
      return;
    }

    wheelInputFrame =
      window.requestAnimationFrame(
        () => {
          wheelInputFrame =
            undefined;

          const delta =
            pendingDelta;

          pendingDelta = 0;

          if (
            !Number.isFinite(delta) ||
            delta === 0
          ) {
            return;
          }

          if (
            isPanelTransitioning() ||
            getNavigationState()
              .panelIndex !== panelIndex
          ) {
            return;
          }

          const direction =
            delta > 0
              ? HOME_SCROLL_DIRECTIONS.DOWN
              : HOME_SCROLL_DIRECTIONS.UP;

          scrubDirection =
            direction;

          /*
           * La entrada y el regreso tienen
           * velocidades ligeramente distintas.
           */
          const multiplier =
            direction ===
            HOME_SCROLL_DIRECTIONS.DOWN
              ? STATEMENT_FORWARD_DELTA_MULTIPLIER
              : STATEMENT_REVERSE_DELTA_MULTIPLIER;

          const adjustedDelta =
            delta * multiplier;

          targetProgress =
            advanceHomeStatementProgress(
              targetProgress,
              adjustedDelta,
              getViewportHeight(),
              reduceMotion,
            );

          if (reduceMotion) {
            commitProgress(
              targetProgress,
            );

            return;
          }

          startScrubLoop();
        },
      );
  };

  const animateTo = (
    target,
    onComplete,
    {
      duration =
        STATEMENT_KEYBOARD_DURATION_SECONDS,

      ease = "power2.inOut",
    } = {},
  ) => {
    stopAnimation();

    targetProgress =
      clamp(target);

    if (reduceMotion) {
      commitProgress(
        targetProgress,
      );

      onComplete?.();

      return;
    }

    const animatedProgress = {
      value: progress.get(),
    };

    commitNavigationState({
      panelIndex,

      phase:
        HOME_SCROLL_PHASES.EFFECT,

      entryDirection: null,
    });

    progressTween =
      gsap.to(
        animatedProgress,
        {
          value:
            targetProgress,

          duration,

          ease,

          overwrite: true,

          onUpdate: () => {
            progress.set(
              animatedProgress.value,
            );
          },

          onComplete: () => {
            progressTween =
              undefined;

            commitProgress(
              targetProgress,
            );

            onComplete?.();
          },
        },
      );
  };

  const animateAutomatically = (
    target,
    onComplete,
  ) => {
    stopAnimation();

    targetProgress =
      clamp(target);

    if (reduceMotion) {
      commitProgress(
        targetProgress,
      );

      onComplete?.();

      return true;
    }

    const animatedProgress = {
      value: progress.get(),
    };

    autoRevealing = true;

    commitNavigationState({
      panelIndex,

      phase:
        HOME_SCROLL_PHASES.EFFECT,

      entryDirection: null,
    });

    const reversing =
      targetProgress <= 0;

    progressTween =
      gsap.to(
        animatedProgress,
        {
          value:
            targetProgress,

          duration:
            reversing
              ? STATEMENT_AUTO_REVERSE_DURATION_SECONDS
              : STATEMENT_AUTO_REVEAL_DURATION_SECONDS,

          ease:
            reversing
              ? "power2.out"
              : "power1.inOut",

          overwrite: true,

          onUpdate: () => {
            progress.set(
              animatedProgress.value,
            );
          },

          onComplete: () => {
            progressTween =
              undefined;

            autoRevealing =
              false;

            commitProgress(
              targetProgress,
            );

            onComplete?.();
          },
        },
      );

    return true;
  };

  const startAutoReveal = (
    onComplete,
  ) =>
    animateAutomatically(
      1,
      onComplete,
    );

  const startAutoReverse = (
    onComplete,
  ) =>
    animateAutomatically(
      0,
      onComplete,
    );

  const synchronizeWithNavigation = (
    nextState,
    currentState,
  ) => {
    stopAnimation();

    if (
      nextState.panelIndex ===
      panelIndex
    ) {
      const nextProgress =
        nextState.phase ===
        HOME_SCROLL_PHASES.TITLE
          ? 1
          : 0;

      targetProgress =
        nextProgress;

      progress.set(
        nextProgress,
      );

      return;
    }

    if (
      currentState.panelIndex ===
      panelIndex
    ) {
      targetProgress = 0;

      progress.set(0);
    }
  };

  const resetForNativeScroll = () => {
    stopAnimation();

    wheelScrubbing = false;

    const currentState =
      getNavigationState();

    if (
      currentState.panelIndex !==
        panelIndex ||
      (
        progress.get() === 0 &&
        currentState.phase ===
          HOME_SCROLL_PHASES.IMAGE
      )
    ) {
      return false;
    }

    targetProgress = 0;

    progress.set(0);

    commitNavigationState(
      createScrollbarHomeScrollState(
        panelIndex,
        {
          settled: false,
        },
      ),
    );

    return true;
  };

  return {
    animateTo,

    commitProgress,

    destroy() {
      if (wheelInputFrame) {
        window.cancelAnimationFrame(
          wheelInputFrame,
        );
      }

      stopScrubLoop();

      progressTween?.kill();

      progressTween =
        undefined;

      pendingDelta = 0;
    },

    getProgress: () =>
      progress.get(),

    isWheelScrubbing: () =>
      wheelScrubbing,

    isAutoRevealing: () =>
      autoRevealing,

    queueDelta,

    resetForNativeScroll,

    resetWheelScrubbing: () => {
      wheelScrubbing = false;
    },

    startWheelScrubbing: () => {
      wheelScrubbing = true;
    },

    stopAnimation,

    startAutoReverse,

    startAutoReveal,

    synchronizeWithNavigation,
  };
}

export {
  STATEMENT_AUTO_REVEAL_DURATION_SECONDS,
  STATEMENT_KEYBOARD_DURATION_SECONDS,
  createHomeStatementController,
};
