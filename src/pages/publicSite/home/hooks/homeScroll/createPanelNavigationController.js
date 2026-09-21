import { gsap } from "gsap";

import { SECTION_NAVIGATION_EASE } from "../../../utils/sectionNavigationMotion.js";
import {
  HOME_SCROLL_DIRECTIONS,
  HOME_SCROLL_PHASES,
  getNextHomeScrollState,
} from "../../utils/homeScrollNavigation.js";
import {
  SCROLL_STEP_DURATION_SECONDS,
  STATEMENT_PANEL_INDEX,
} from "./homeScrollConstants.js";

const STATEMENT_ENTRY_DURATION_SECONDS = 1;

function createPanelNavigationController({
  coordination,
  navigationStateRef,
  panels,
  reduceMotion,
  runtime,
  scroller,
  statement,
  titleRevealLockedRef,
  commitNavigationState,
}) {
  const releaseTransitionLock = () => {
    runtime.wheelTransitionLock = false;
  };

  const completeProgrammaticScroll = (onComplete) => {
    runtime.activeTween = undefined;
    runtime.isProgrammaticScroll = false;
    releaseTransitionLock();
    onComplete?.();
  };

  const startScrollTransition = ({ scrollTop, onComplete, replace = false }) => {
    if (replace) {
      cancelActiveTween();
      runtime.isProgrammaticScroll = false;
    }
    if (runtime.activeTween || runtime.isProgrammaticScroll) return false;

    runtime.isProgrammaticScroll = true;
    runtime.ignoreNextScrollEnd = runtime.supportsScrollEnd;

    if (reduceMotion) {
      scroller.scrollTop = scrollTop;
      runtime.requestAnimationFrame(() => completeProgrammaticScroll(onComplete));
      return true;
    }

    runtime.activeTween = gsap.to(scroller, {
      scrollTo: { y: scrollTop, autoKill: false },
      duration: SCROLL_STEP_DURATION_SECONDS,
      ease: SECTION_NAVIGATION_EASE,
      overwrite: true,
      onComplete: () => completeProgrammaticScroll(onComplete),
    });
    return true;
  };

  const cancelActiveTween = () => {
    runtime.activeTween?.kill();
    runtime.activeTween = undefined;
  };

  const alignToPanel = (nextState) => {
    if (runtime.activeTween) return false;

    const currentState = navigationStateRef.current;
    const panelChanged = nextState.panelIndex !== currentState.panelIndex;
    const targetPanel = panels[nextState.panelIndex];
    const targetScrollTop = targetPanel?.offsetTop ?? 0;
    const needsAlignment = Math.abs(scroller.scrollTop - targetScrollTop) > 1;
    const isStatementEntry =
      panelChanged &&
      nextState.panelIndex === STATEMENT_PANEL_INDEX &&
      (nextState.entryDirection === HOME_SCROLL_DIRECTIONS.DOWN ||
        runtime.statementEnteringUp);
    const isStatementEntryDown =
      nextState.panelIndex === STATEMENT_PANEL_INDEX &&
      nextState.entryDirection === HOME_SCROLL_DIRECTIONS.DOWN;
    const isStatementEntryUp =
      nextState.panelIndex === STATEMENT_PANEL_INDEX &&
      runtime.statementEnteringUp;

    statement.synchronizeWithNavigation(nextState, currentState);
    if (
      nextState.panelIndex < STATEMENT_PANEL_INDEX &&
      nextState.phase === HOME_SCROLL_PHASES.TITLE &&
      (currentState.panelIndex !== nextState.panelIndex ||
        currentState.phase !== HOME_SCROLL_PHASES.TITLE)
    ) {
      titleRevealLockedRef.current = true;
    }
    commitNavigationState(nextState);
    if (panelChanged) {
      runtime.wheelTransitionLock = true;
    }
    if (!panelChanged && !needsAlignment) {
      runtime.statementEnteringUp = false;
      return true;
    }

    runtime.isProgrammaticScroll = true;
    runtime.ignoreNextScrollEnd = runtime.supportsScrollEnd;
    const completeAlignment = () => {
      runtime.isProgrammaticScroll = false;
      if (
        isStatementEntryDown &&
        window.matchMedia?.("(max-width: 1023px)").matches
      ) {
        runtime.wheelTransitionLock = true;
        statement.startAutoReveal(() => {
          releaseTransitionLock();
          coordination.content?.synchronizeTitleVisibility();
        });
        runtime.statementEnteringUp = false;
        coordination.content?.synchronizeTitleVisibility();
        return;
      }
      runtime.statementEnteringUp = false;

      if (panelChanged) {
        /*
         * Al entrar en un nuevo panel, la inercia restante del mismo
         * gesto de wheel/trackpad no puede revelar su título.
         * Esperamos a que exista una pausa real antes de desbloquear
         * la siguiente intención.
         */
        coordination.input?.scheduleWheelGestureSettlement();
      } else {
        releaseTransitionLock();
      }

      coordination.content?.synchronizeTitleVisibility();
    };

    if (reduceMotion) {
      scroller.scrollTop = targetScrollTop;
      runtime.requestAnimationFrame(completeAlignment);
      return true;
    }

    runtime.activeTween = gsap.to(scroller, {
      scrollTo: { y: targetScrollTop, autoKill: false },
      duration: isStatementEntry
        ? STATEMENT_ENTRY_DURATION_SECONDS
        : SCROLL_STEP_DURATION_SECONDS,
      ease: isStatementEntry || isStatementEntryUp
        ? "power3.inOut"
        : SECTION_NAVIGATION_EASE,
      overwrite: true,
      onComplete: () => {
        runtime.activeTween = undefined;
        completeAlignment();
      },
    });
    return true;
  };

  const moveByDirection = (direction) => {
    if (runtime.activeTween) return false;
    const currentState = navigationStateRef.current;
    const leavesStatementStart =
      currentState.panelIndex === STATEMENT_PANEL_INDEX &&
      direction === HOME_SCROLL_DIRECTIONS.UP &&
      statement.getProgress() <= 0;
    const nextState = getNextHomeScrollState(
      currentState,
      direction,
      panels.length,
      { skipCurrentImageReveal: leavesStatementStart },
    );
    return nextState === currentState ? false : alignToPanel(nextState);
  };

  return {
    alignToPanel,
    cancelActiveTween,
    destroy: cancelActiveTween,
    moveByDirection,
    releaseTransitionLock,
    startScrollTransition,
  };
}

export { createPanelNavigationController };
