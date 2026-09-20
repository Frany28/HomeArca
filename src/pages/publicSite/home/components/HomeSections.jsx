import HomeScrollPanel from "./HomeScrollPanel/HomeScrollPanel.jsx";
import HomeStatementPanel from "./HomeStatementPanel/HomeStatementPanel.jsx";
import { HOME_SCROLL_PHASES } from "../utils/homeScrollNavigation.js";
import { HOME_IMAGE_PANELS, HOME_STATEMENT } from "../homeContent.js";

function HomeSections({
  active,
  mediaEnabled = active,
  navigationState,
  onInitialTitleReveal,
  onTitleRevealComplete,
  statementPanelIndex,
  statementProgress,
}) {
  return (
    <>
      {HOME_IMAGE_PANELS.map((panel, panelIndex) => (
        <HomeScrollPanel
          key={panel.title}
          {...panel}
          showScrollHint={panelIndex === 0}
          onTitleRevealComplete={() => {
            onTitleRevealComplete?.(panelIndex);
            if (panelIndex === 0) onInitialTitleReveal?.();
          }}
          titleVisible={
            active &&
            navigationState.panelIndex === panelIndex &&
            navigationState.phase === HOME_SCROLL_PHASES.TITLE
          }
        />
      ))}
      <HomeStatementPanel
        active={active && navigationState.panelIndex === statementPanelIndex}
        effectStarted={
          active &&
          navigationState.panelIndex === statementPanelIndex &&
          navigationState.phase !== HOME_SCROLL_PHASES.IMAGE
        }
        mediaEnabled={mediaEnabled}
        {...HOME_STATEMENT}
        progress={statementProgress}
        statementVisible={
          active &&
          navigationState.panelIndex === statementPanelIndex &&
          navigationState.phase === HOME_SCROLL_PHASES.TITLE
        }
      />
    </>
  );
}

export default HomeSections;
