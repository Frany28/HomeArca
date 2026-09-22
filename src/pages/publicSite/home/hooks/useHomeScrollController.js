import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useMotionValue } from "motion/react";

import { createAboutStoryController } from "./homeScroll/createAboutStoryController.js";
import {
  createContentScrollController,
  isVisibleWithinViewport,
} from "./homeScroll/createContentScrollController.js";
import { createFeaturedProjectsController } from "./homeScroll/createFeaturedProjectsController.js";
import { createHomeStatementController } from "./homeScroll/createHomeStatementController.js";
import { createInputGestureController } from "./homeScroll/createInputGestureController.js";
import { createPanelNavigationController } from "./homeScroll/createPanelNavigationController.js";

import {
  SCROLL_SETTLE_DELAY_MS,
  SCROLL_STEP_DURATION_SECONDS,
  STATEMENT_PANEL_INDEX,
  TOUCH_SWIPE_THRESHOLD_PX,
  TOUCH_VERTICAL_DOMINANCE,
  WHEEL_GESTURE_IDLE_MS,
  WHEEL_GESTURE_THRESHOLD_PX,
} from "./homeScroll/homeScrollConstants.js";

import {
  createHomeScrollState,
  createWheelGestureState,
} from "../utils/homeScrollNavigation.js";

const INITIAL_NAVIGATION_STATE = createHomeScrollState();

gsap.registerPlugin(ScrollToPlugin);

function useHomeScrollController({
  enabled,
  initialScrollReady,
  reduceMotion,
}) {
  const [navigationState, setNavigationState] = useState(
    INITIAL_NAVIGATION_STATE,
  );

  const scrollerRef = useRef(null);
  const navigationStateRef = useRef(INITIAL_NAVIGATION_STATE);

  const titleRevealLockedRef = useRef(false);
  const inputGestureControllerRef = useRef(null);

  /*
   * PROGRESO DE EFECTOS
   */

  const statementProgress = useMotionValue(0);

  const aboutStoryProgress = useMotionValue(0);

  const firstFeaturedExpansionProgress = useMotionValue(0);
  const secondFeaturedExpansionProgress = useMotionValue(0);
  const thirdFeaturedExpansionProgress = useMotionValue(0);

  const firstFeaturedPreparationOffset = useMotionValue(0);
  const secondFeaturedPreparationOffset = useMotionValue(0);
  const thirdFeaturedPreparationOffset = useMotionValue(0);

  const featuredProjectExpansionProgress = useMemo(
    () => [
      firstFeaturedExpansionProgress,
      secondFeaturedExpansionProgress,
      thirdFeaturedExpansionProgress,
    ],
    [
      firstFeaturedExpansionProgress,
      secondFeaturedExpansionProgress,
      thirdFeaturedExpansionProgress,
    ],
  );

  const featuredProjectPreparationOffsets = useMemo(
    () => [
      firstFeaturedPreparationOffset,
      secondFeaturedPreparationOffset,
      thirdFeaturedPreparationOffset,
    ],
    [
      firstFeaturedPreparationOffset,
      secondFeaturedPreparationOffset,
      thirdFeaturedPreparationOffset,
    ],
  );

  /*
   * ESTADO DE NAVEGACIÓN
   */

  const [contentScrollActive, setContentScrollActive] =
    useState(false);

  const contentModeRef = useRef(false);

  const [activeSectionId, setActiveSectionId] =
    useState(null);

  const activeSectionRef = useRef(null);

  const [featuredStep, setFeaturedStep] =
    useState(1);

  const [
    visibleContentTitleIds,
    setVisibleContentTitleIds,
  ] = useState([]);

  const [
    activeFeaturedProjectIndex,
    setActiveFeaturedProjectIndex,
  ] = useState(0);

  const activeFeaturedProjectIndexRef = useRef(0);

  const sectionNavigationRef = useRef(null);

  /*
   * NAVEGACIÓN DESDE NAVBAR / HASH
   */

  const navigateToSection = useCallback(
    (sectionId) => {
      sectionNavigationRef.current?.(sectionId);
    },
    [],
  );

  /*
   * FINALIZACIÓN DE REVEAL DE TÍTULOS
   */

  const completeTitleReveal = useCallback(
    (panelIndex) => {
      if (
        panelIndex !==
        navigationStateRef.current.panelIndex
      ) {
        return;
      }

      titleRevealLockedRef.current = false;
      inputGestureControllerRef.current?.requireFreshWheelGesture();
    },
    [],
  );

  /*
   * RESET INICIAL
   */

  useLayoutEffect(() => {
    if (
      !initialScrollReady &&
      scrollerRef.current
    ) {
      scrollerRef.current.scrollTop = 0;
    }
  }, [initialScrollReady]);

  /*
   * CONTROLADOR PRINCIPAL
   */

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;

    if (!enabled || !scroller) {
      return undefined;
    }

    const panels = gsap.utils.toArray(
      "[data-home-panel]",
      scroller,
    );

    /*
     * Runtime compartido por todos los
     * controladores del Home.
     */

    const runtime = {
      activeTween: undefined,

      animationFrames: new Set(),

      contentMode: contentModeRef.current,

      ignoreNextScrollEnd: false,

      isProgrammaticScroll: false,

      nativeScrollOriginState: null,

      scrollbarDragging: false,

      scrollbarOriginState: null,

      resizeFrame: undefined,

      scrollSettleTimer: undefined,

      statementEnteringUp: false,

      supportsScrollEnd:
        "onscrollend" in scroller,

      wheelGestureDeltaScale: null,

      wheelGestureState:
        createWheelGestureState(),

      wheelIdleTimer: undefined,

      wheelTransitionLock: false,
    };

    runtime.requestAnimationFrame = (
      callback,
    ) => {
      let frameId;

      frameId =
        window.requestAnimationFrame(() => {
          runtime.animationFrames.delete(
            frameId,
          );

          callback();
        });

      runtime.animationFrames.add(frameId);

      return frameId;
    };

    runtime.cancelAnimationFrame = (
      frameId,
    ) => {
      window.cancelAnimationFrame(frameId);

      runtime.animationFrames.delete(
        frameId,
      );
    };

    /*
     * Objeto compartido entre controladores.
     */

    const coordination = {};

    const commitNavigationState = (
      nextState,
    ) => {
      navigationStateRef.current = nextState;

      setNavigationState(nextState);
    };

    /*
     * FRASE DEL HOME
     */

    const statement =
      createHomeStatementController({
        commitNavigationState,

        getNavigationState: () =>
          navigationStateRef.current,

        getViewportHeight: () =>
          scroller.clientHeight,

        isPanelTransitioning: () =>
          Boolean(runtime.activeTween),

        panelIndex:
          STATEMENT_PANEL_INDEX,

        progress:
          statementProgress,

        reduceMotion,
      });

    /*
     * NAVEGACIÓN ENTRE PANELES
     */

    coordination.panel =
      createPanelNavigationController({
        coordination,

        navigationStateRef,

        panels,

        reduceMotion,

        runtime,

        scroller,

        statement,

        titleRevealLockedRef,

        commitNavigationState,
      });

    /*
     * PROYECTOS DESTACADOS
     */

    coordination.featured =
      createFeaturedProjectsController({
        activeFeaturedProjectIndexRef,

        activeSectionRef,

        coordination,

        expansionProgress:
          featuredProjectExpansionProgress,

        preparationOffsets:
          featuredProjectPreparationOffsets,

        reduceMotion,

        runtime,

        scroller,

        setActiveFeaturedProjectIndex,
      });

    /*
     * ABOUT US
     *
     * Controla:
     * - bloqueo de imagen
     * - blur
     * - créditos
     * - reducción final
     * - reversa al subir
     */

    coordination.about =
      createAboutStoryController({
        coordination,

        progress: aboutStoryProgress,

        reduceMotion,

        runtime,

        scroller,
      });

    /*
     * SCROLL DE CONTENIDO
     */

    coordination.content =
      createContentScrollController({
        activeSectionRef,

        contentModeRef,

        coordination,

        navigationStateRef,

        panels,

        runtime,

        scroller,

        statement,

        titleRevealLockedRef,

        commitNavigationState,

        setActiveSectionId,

        setContentScrollActive,

        setFeaturedStep,

        setVisibleContentTitleIds,
      });

    /*
     * MOUSE / TRACKPAD / TOUCH /
     * TECLADO
     */

    coordination.input =
      createInputGestureController({
        activeFeaturedProjectIndexRef,

        activeSectionRef,

        coordination,

        navigationStateRef,

        reduceMotion,

        runtime,

        scroller,

        statement,

        titleRevealLockedRef,
      });

    inputGestureControllerRef.current = coordination.input;

    /*
     * Navegación directa desde navbar.
     */

    sectionNavigationRef.current = (
      sectionId,
    ) =>
      coordination.content.navigateSection(
        sectionId,
        {
          direct: true,
        },
      );

    /*
     * Inicialización.
     */

    coordination.content.initialize();

    coordination.input.attach();

    /*
     * CLEANUP
     */

    return () => {
      sectionNavigationRef.current = null;

      coordination.input.destroy();

      coordination.about.destroy();

      coordination.content.destroy();

      coordination.featured.destroy();

      coordination.panel.destroy();

      runtime.animationFrames.forEach(
        (frameId) => {
          window.cancelAnimationFrame(
            frameId,
          );
        },
      );

      runtime.animationFrames.clear();

      titleRevealLockedRef.current = false;

      inputGestureControllerRef.current = null;

      statement.destroy();
    };
  }, [
    enabled,

    aboutStoryProgress,

    featuredProjectExpansionProgress,

    featuredProjectPreparationOffsets,

    reduceMotion,

    statementProgress,
  ]);

  /*
   * API DEL HOOK
   */

  return {
    activeFeaturedProjectIndex,

    activeSectionId,

    aboutStoryProgress,

    featuredStep,

    featuredProjectExpansionProgress,

    featuredProjectPreparationOffsets,

    contentScrollActive,

    navigateToSection,

    completeTitleReveal,

    navigationState,

    scrollerRef,

    statementPanelIndex:
      STATEMENT_PANEL_INDEX,

    statementProgress,

    visibleContentTitleIds,
  };
}

export {
  SCROLL_STEP_DURATION_SECONDS,

  SCROLL_SETTLE_DELAY_MS,

  STATEMENT_PANEL_INDEX,

  TOUCH_SWIPE_THRESHOLD_PX,

  TOUCH_VERTICAL_DOMINANCE,

  WHEEL_GESTURE_IDLE_MS,

  WHEEL_GESTURE_THRESHOLD_PX,

  isVisibleWithinViewport,
};

export default useHomeScrollController;
