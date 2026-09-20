import { useEffect, useState } from "react";

import HomeHeroTitle from "../HomeHeroTitle/HomeHeroTitle.jsx";
import HomeScrollHint from "../HomeScrollHint/HomeScrollHint.jsx";

function HomeScrollPanel({
  captionDescriptionNodeId,
  captionNodeId,
  captionTitleNodeId,
  description,
  image,
  imageAlt,
  projectName,
  scrollHintVariant,
  title,
  titleVisible = false,
  onTitleRevealComplete,
}) {
  const [scrollHintVisible, setScrollHintVisible] = useState(false);

  useEffect(() => {
    if (!titleVisible) {
      setScrollHintVisible(false);
    }
  }, [titleVisible]);

  const handleTitleRevealComplete = () => {
    setScrollHintVisible(true);
    onTitleRevealComplete?.();
  };

  return (
    <section
      className="relative h-dvh w-full shrink-0 overflow-hidden bg-[var(--color-neutral-950-uniform)]"
      aria-label={title}
      data-home-panel
    >
      <img
        src={image}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/5 to-black/20"
        data-navbar-scrim="0.4,0.05,0.2"
        aria-hidden="true"
      />
      <HomeHeroTitle
        captionDescriptionNodeId={captionDescriptionNodeId}
        captionNodeId={captionNodeId}
        captionTitleNodeId={captionTitleNodeId}
        description={description}
        projectName={projectName}
        title={title}
        visible={titleVisible}
        onRevealComplete={handleTitleRevealComplete}
      />
      {scrollHintVariant && titleVisible && scrollHintVisible && (
        <HomeScrollHint variant={scrollHintVariant} />
      )}
    </section>
  );
}

export default HomeScrollPanel;
