import { useLayoutEffect } from "react";

import {
  BROWSER_CHROME_RELEASE_DELAY_MS,
  shouldRestoreBrowserChromeScroll,
} from "../utils/browserChromeScrollGuard.js";

function useBrowserChromeScrollGuard({ enabled, scrollerRef }) {
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;

    if (!enabled || !scroller) return undefined;

    let browserChromeActive = false;
    let preservedScrollTop = scroller.scrollTop;
    let releaseTimer = 0;

    const clearReleaseTimer = () => {
      window.clearTimeout(releaseTimer);
      releaseTimer = 0;
    };

    const releaseGuard = () => {
      clearReleaseTimer();
      browserChromeActive = false;
      preservedScrollTop = scroller.scrollTop;
    };

    const notePageIntent = () => {
      releaseGuard();
    };

    const restorePreservedPosition = () => {
      if (Math.abs(scroller.scrollTop - preservedScrollTop) > 1) {
        scroller.scrollTop = preservedScrollTop;
      }
    };

    const armGuard = () => {
      clearReleaseTimer();
      preservedScrollTop = scroller.scrollTop;
      browserChromeActive = true;
    };

    const handleWindowFocus = () => {
      restorePreservedPosition();
      clearReleaseTimer();
      releaseTimer = window.setTimeout(
        releaseGuard,
        BROWSER_CHROME_RELEASE_DELAY_MS,
      );
    };

    const handleVisibilityChange = () => {
      if (document.hidden) armGuard();
      else handleWindowFocus();
    };

    const handleScroll = (event) => {
      const nextScrollTop = scroller.scrollTop;
      const documentFocused = document.hasFocus?.() ?? true;
      const shouldRestore = shouldRestoreBrowserChromeScroll({
        browserChromeActive,
        documentFocused,
        nextScrollTop,
        preservedScrollTop,
      });

      if (shouldRestore) {
        event.stopImmediatePropagation();
        scroller.scrollTop = preservedScrollTop;
        return;
      }

      if (!browserChromeActive && documentFocused) {
        preservedScrollTop = nextScrollTop;
      }
    };

    window.addEventListener("blur", armGuard, true);
    window.addEventListener("focus", handleWindowFocus, true);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("pointerdown", notePageIntent, true);
    document.addEventListener("mousedown", notePageIntent, true);
    document.addEventListener("keydown", notePageIntent, true);
    scroller.addEventListener("touchstart", notePageIntent, {
      capture: true,
      passive: true,
    });
    scroller.addEventListener("wheel", notePageIntent, {
      capture: true,
      passive: true,
    });
    scroller.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });

    return () => {
      clearReleaseTimer();
      window.removeEventListener("blur", armGuard, true);
      window.removeEventListener("focus", handleWindowFocus, true);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("pointerdown", notePageIntent, true);
      document.removeEventListener("mousedown", notePageIntent, true);
      document.removeEventListener("keydown", notePageIntent, true);
      scroller.removeEventListener("touchstart", notePageIntent, true);
      scroller.removeEventListener("wheel", notePageIntent, true);
      scroller.removeEventListener("scroll", handleScroll, true);
    };
  }, [enabled, scrollerRef]);
}

export default useBrowserChromeScrollGuard;
