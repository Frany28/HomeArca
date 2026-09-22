const BROWSER_CHROME_RELEASE_DELAY_MS = 500;
const SCROLL_POSITION_TOLERANCE_PX = 1;

function shouldRestoreBrowserChromeScroll({
  browserChromeActive,
  documentFocused,
  nextScrollTop,
  preservedScrollTop,
}) {
  const positionChanged =
    Math.abs(nextScrollTop - preservedScrollTop) >
    SCROLL_POSITION_TOLERANCE_PX;

  if (!positionChanged) return false;
  return browserChromeActive || !documentFocused;
}

export {
  BROWSER_CHROME_RELEASE_DELAY_MS,
  SCROLL_POSITION_TOLERANCE_PX,
  shouldRestoreBrowserChromeScroll,
};
