import HomeHeroTitle from "../HomeHeroTitle/HomeHeroTitle.jsx";

function HomeScrollPanel({
  captionDescriptionNodeId,
  captionNodeId,
  captionTitleNodeId,
  description,
  image,
  imageAlt,
  projectName,
  title,
  titleVisible = false,
  onTitleRevealComplete,
}) {
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
        onRevealComplete={onTitleRevealComplete}
      />
    </section>
  );
}

export default HomeScrollPanel;
