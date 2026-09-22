import {
  HOME_SCROLL_PHASES,
  createHomeScrollState,
  createScrollbarHomeScrollState,
  getNearestPanelIndex,
  getSequentialScrollbarPanelIndex,
} from "../../utils/homeScrollNavigation.js";
import {
  CONTENT_TITLE_SCOPE_SELECTOR,
  SCROLL_SETTLE_DELAY_MS,
  STATEMENT_PANEL_INDEX,
} from "./homeScrollConstants.js";

function isVisibleWithinViewport(elementRect, viewportRect) {
  return (
    elementRect.bottom > viewportRect.top &&
    elementRect.top < viewportRect.bottom
  );
}

function createContentScrollController({
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
}) {
  const setContentMode = (value) => {
    runtime.contentMode = value;
    contentModeRef.current = value;
    setContentScrollActive(value);
    window.clearTimeout(runtime.scrollSettleTimer);
    runtime.nativeScrollOriginState = null;
  };

  const getSection = (id) =>
    [...scroller.querySelectorAll("section[id]")].find((section) => section.id === id);

  const synchronizeTitleVisibility = () => {
    const viewportRect = scroller.getBoundingClientRect();
    const nextVisibleIds = [...scroller.querySelectorAll(CONTENT_TITLE_SCOPE_SELECTOR)]
      .filter((element) =>
        isVisibleWithinViewport(element.getBoundingClientRect(), viewportRect),
      )
      .map((element) => element.dataset.contentTitleScope);

    setVisibleContentTitleIds((currentVisibleIds) =>
      currentVisibleIds.length === nextVisibleIds.length &&
      currentVisibleIds.every((id, index) => id === nextVisibleIds[index])
        ? currentVisibleIds
        : nextVisibleIds,
    );
  };

  const selectSection = (id) => {
    if (!id || id === "services") coordination.featured.commitProjectIndex(0);
    if (activeSectionRef.current === id) return;
    activeSectionRef.current = id;
    setActiveSectionId(id);
  };

  const synchronizeContentScroll = ({ titlesSynchronized = false } = {}) => {
    if (!titlesSynchronized) synchronizeTitleVisibility();

    const servicesTop = getSection("services")?.offsetTop;
   if (servicesTop !== undefined && scroller.scrollTop < servicesTop - 1) {
      setContentMode(false);
      selectSection(null);

    runtime.statementEnteringUp = true;

      coordination.panel.alignToPanel(createHomeScrollState({
        panelIndex: STATEMENT_PANEL_INDEX,
        phase: HOME_SCROLL_PHASES.TITLE,
      }));

      return;
    }

    const featured = getSection("featured-projects");
    const contentSections = [...scroller.querySelectorAll("section[id]")];
    const activeContentSection = contentSections.reduce(
      (currentSection, section) =>
        scroller.scrollTop + 64 >= section.offsetTop ? section : currentSection,
      contentSections[0],
    );
    const featuredIsActive = activeContentSection?.id === "featured-projects";
    selectSection(activeContentSection?.id ?? "services");
    if (featuredIsActive) coordination.featured.synchronizeProject(featured);

    const gallery = featured?.querySelector?.("[data-featured-gallery]");
    if (
      gallery &&
      gallery.getBoundingClientRect().top < scroller.getBoundingClientRect().bottom
    ) {
      setFeaturedStep((currentStep) => (currentStep === 2 ? currentStep : 2));
    }
  };

 const navigateSection = (sectionId, { direct = false } = {}) => {
  const currentState = navigationStateRef.current;

    const currentSectionComplete = runtime.contentMode
      ? true
      : currentState.phase === HOME_SCROLL_PHASES.TITLE &&
        (
          currentState.panelIndex === STATEMENT_PANEL_INDEX
            ? statement.getProgress() >= 1
            : !titleRevealLockedRef.current
        );

    if (
      !direct &&
      (runtime.activeTween ||
        runtime.isProgrammaticScroll ||
        !currentSectionComplete)
    ) return;

    const target = sectionId === "home"
      ? panels[0]
      : getSection(sectionId);

    if (!target) return;


    const leavingFeatured =
      activeSectionRef.current === "featured-projects" &&
      sectionId !== "featured-projects";

    coordination.panel.cancelActiveTween();
    if (activeSectionRef.current === "featured-projects") {
      coordination.featured.cancelExpansionTweens();
    }
    statement.stopAnimation();
    statement.resetWheelScrubbing();
    titleRevealLockedRef.current = false;
    runtime.wheelTransitionLock = true;
    window.clearTimeout(runtime.scrollSettleTimer);

    commitNavigationState(createScrollbarHomeScrollState(
      sectionId === "home" ? 0 : STATEMENT_PANEL_INDEX,
    ));
    runtime.statementEnteringUp = false;

    coordination.panel.startScrollTransition({
      scrollTop: target.offsetTop,
      replace: true,
      onComplete: () => {
        statement.commitProgress(0);

        if (sectionId === "home") {
          setContentMode(false);
          selectSection(null);
          coordination.featured.resetNavigationState();
          synchronizeTitleVisibility();
          return;
        }

        setContentMode(true);
        if (sectionId === "featured-projects" || leavingFeatured) {
          coordination.featured.resetNavigationState();
        }
        synchronizeContentScroll();
      },
    });
  };

  const settleNativeScroll = () => {
    window.clearTimeout(runtime.scrollSettleTimer);
    if (runtime.contentMode || runtime.isProgrammaticScroll || runtime.activeTween) return;
    const requestedPanelIndex = getNearestPanelIndex(
      scroller.scrollTop,
      panels.map((panel) => panel.offsetTop),
    );
    const originState = runtime.nativeScrollOriginState ?? navigationStateRef.current;
    const panelIndex =
      titleRevealLockedRef.current || originState.phase !== HOME_SCROLL_PHASES.TITLE
        ? originState.panelIndex
        : getSequentialScrollbarPanelIndex(
            originState.panelIndex,
            requestedPanelIndex,
            panels.length,
          );
    runtime.nativeScrollOriginState = null;
    coordination.panel.alignToPanel(createScrollbarHomeScrollState(panelIndex));
  };

  const handleNativeScroll = () => {
    if (runtime.isProgrammaticScroll) {
      synchronizeTitleVisibility();
      return;
    }

    if (runtime.scrollbarDragging) {
      return;
    }

    if (runtime.contentMode) {
      if (coordination.about?.pinStory()) {
        synchronizeTitleVisibility();
        return;
      }
      if (coordination.featured.pinExpansion()) {
        synchronizeTitleVisibility();
        return;
      }
      synchronizeContentScroll();
      return;
    }

    synchronizeTitleVisibility();
    const statementTop = panels[STATEMENT_PANEL_INDEX]?.offsetTop ?? 0;
    if (scroller.scrollTop > statementTop + 1) {
      const currentState = navigationStateRef.current;
      if (
        currentState.panelIndex === STATEMENT_PANEL_INDEX &&
        currentState.phase === HOME_SCROLL_PHASES.TITLE &&
        statement.getProgress() >= 1
      ) {
        navigateSection("services");
      } else {
        scroller.scrollTop = panels[currentState.panelIndex]?.offsetTop ?? 0;
      }
      return;
    }

    runtime.ignoreNextScrollEnd = false;
    const currentState = navigationStateRef.current;
    runtime.nativeScrollOriginState ??= currentState;
    if (currentState.panelIndex === STATEMENT_PANEL_INDEX) {
      statement.resetForNativeScroll();
    } else if (currentState.phase === HOME_SCROLL_PHASES.TITLE) {
      commitNavigationState(createScrollbarHomeScrollState(
        currentState.panelIndex,
        { settled: false },
      ));
    }

    if (!runtime.supportsScrollEnd) {
      window.clearTimeout(runtime.scrollSettleTimer);
      runtime.scrollSettleTimer = window.setTimeout(
        settleNativeScroll,
        SCROLL_SETTLE_DELAY_MS,
      );
    }
  };

  const handleScrollEnd = () => {
    if (runtime.ignoreNextScrollEnd) {
      runtime.ignoreNextScrollEnd = false;
      return;
    }
    settleNativeScroll();
  };

  const handleResize = () => {
    if (runtime.contentMode) {
      const servicesTop = getSection("services")?.offsetTop;
      if (servicesTop !== undefined && scroller.scrollTop < servicesTop) {
        scroller.scrollTop = servicesTop;
      }
      synchronizeContentScroll();
      return;
    }

    runtime.cancelAnimationFrame(runtime.resizeFrame);
    runtime.resizeFrame = runtime.requestAnimationFrame(() => {
      coordination.panel.cancelActiveTween();
      runtime.isProgrammaticScroll = true;
      runtime.ignoreNextScrollEnd = runtime.supportsScrollEnd;
      const activePanel = panels[navigationStateRef.current.panelIndex];
      scroller.scrollTop = activePanel?.offsetTop ?? 0;
      runtime.requestAnimationFrame(() => {
        runtime.isProgrammaticScroll = false;
        synchronizeTitleVisibility();
      });
    });
  };

  const initialize = () => {
    runtime.isProgrammaticScroll = true;
    runtime.ignoreNextScrollEnd = runtime.supportsScrollEnd;
    synchronizeTitleVisibility();
    if (!runtime.contentMode) {
      scroller.scrollTop = panels[navigationStateRef.current.panelIndex]?.offsetTop ?? 0;
    }
    runtime.resizeFrame = runtime.requestAnimationFrame(() => {
      runtime.isProgrammaticScroll = false;
    });
  };

  const destroy = () => {
    runtime.cancelAnimationFrame(runtime.resizeFrame);
    window.clearTimeout(runtime.scrollSettleTimer);
  };

  const beginScrollbarDrag = () => {
    if (runtime.activeTween || runtime.isProgrammaticScroll) return;

    runtime.scrollbarDragging = true;
    runtime.scrollbarOriginState = navigationStateRef.current;

    window.clearTimeout(runtime.scrollSettleTimer);

    statement.stopAnimation();
    statement.resetWheelScrubbing();

    if (runtime.contentMode) {
      coordination.featured.prepareForScrollbarNavigation();
    }
  };

  const endScrollbarDrag = () => {
  if (!runtime.scrollbarDragging) return;

  runtime.scrollbarDragging = false;

  const servicesTop = getSection("services")?.offsetTop;
  const currentScrollTop = scroller.scrollTop;

  runtime.nativeScrollOriginState = null;
  titleRevealLockedRef.current = false;

  /*
   * La barra es navegación directa.
   * No ejecutamos la narrativa de wheel/trackpad.
   */
  if (
    servicesTop !== undefined &&
    currentScrollTop >= servicesTop - 1
  ) {
    statement.stopAnimation();
    statement.resetWheelScrubbing();

    coordination.featured.prepareForScrollbarNavigation();

    commitNavigationState(
      createScrollbarHomeScrollState(
        STATEMENT_PANEL_INDEX,
        { settled: false },
      ),
    );

    statement.commitProgress(0);

    setContentMode(true);
    synchronizeContentScroll();

    return;
  }

  /*
   * Si soltamos la barra dentro de la introducción,
   * alineamos limpiamente al panel más cercano.
   */
    setContentMode(false);
    selectSection(null);

    const panelIndex = getNearestPanelIndex(
      currentScrollTop,
      panels.map((panel) => panel.offsetTop),
    );

    coordination.panel.alignToPanel(
      createScrollbarHomeScrollState(panelIndex),
    );
  };

  return {
  beginScrollbarDrag,
  destroy,
  endScrollbarDrag,
  getSection,
  handleNativeScroll,
  handleResize,
  handleScrollEnd,
  initialize,
  navigateSection,
  selectSection,
  setContentMode,
  settleNativeScroll,
  synchronizeContentScroll,
  synchronizeTitleVisibility,
  };
}

export { createContentScrollController, isVisibleWithinViewport };
