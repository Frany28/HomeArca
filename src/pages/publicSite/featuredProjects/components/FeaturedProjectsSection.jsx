import FeaturedProjectsGallery from "./FeaturedProjectsGallery.jsx";
import FeaturedProjectsProjectPanel, {
  APTO_JC_PROJECT,
} from "./FeaturedProjectsProjectPanel.jsx";
import SectionTitleReveal from "../../components/SectionTitleReveal.jsx";

function FeaturedProjectsSection({
  active = false,
  activeProjectIndex = 0,
  expansionProgress = [],
  preparationOffsets = [],
  step = 1,
  onRevealComplete,
  titleVisibility = [],
}) {
  const firstProjectActive = active && activeProjectIndex === 0;

  return (
    <section
      id="featured-projects"
      aria-label="Proyectos destacados"
      className="dark relative flex flex-col overflow-hidden bg-[var(--color-neutral-950-uniform)]"
    >
      <article
        data-featured-project-panel
        data-content-title-scope="featured-project-quinta-bella-vista"
        aria-label="Proyecto destacado Quinta Bella Vista"
        aria-hidden={!firstProjectActive}
        inert={firstProjectActive ? undefined : ""}
        className="relative flex min-h-0 flex-col bg-[var(--color-neutral-950-uniform)] pt-[var(--spacing-gap-9)] max-[1023px]:min-h-dvh"
      >
        <SectionTitleReveal
          visible={Boolean(titleVisibility[0])}
          className="mx-auto flex w-full shrink-0 max-w-[1200px] flex-col items-center gap-[24px] px-[16px] py-[var(--spacing-gap-8)] text-center text-[var(--color-neutral-100-uniform)] min-[768px]:px-[var(--spacing-gap-8)]"
          data-node-id="4856:5032"
        >
          <p className="text-heading-4 m-0 w-full" data-node-id="4856:5033">
            Proyectos Destacados
          </p>
          <h2 className="text-heading-1 m-0 w-full max-[767px]:text-[38px] max-[767px]:leading-[46px]" data-node-id="4856:5034">
            Quinta Bella Vista
          </h2>
          <p className="text-heading-6 m-0 w-full max-w-[520px] opacity-60" data-node-id="4856:5035">
            Diseño arquitectónico y ejecución integral para una residencia contemporánea ubicada en Maracaibo.
          </p>
        </SectionTitleReveal>
        <FeaturedProjectsGallery
          active={firstProjectActive}
          expansionProgress={expansionProgress[0]}
          preparationOffset={preparationOffsets[0]}
          sectionReveal={false}
          visible={step === 2}
          onRevealComplete={onRevealComplete}
        />
      </article>
      <FeaturedProjectsProjectPanel
        active={active && activeProjectIndex === 1}
        expansionProgress={expansionProgress[1]}
        preparationOffset={preparationOffsets[1]}
        titleVisible={Boolean(titleVisibility[1])}
      />
      <FeaturedProjectsProjectPanel
        active={active && activeProjectIndex === 2}
        expansionProgress={expansionProgress[2]}
        preparationOffset={preparationOffsets[2]}
        project={APTO_JC_PROJECT}
        titleVisible={Boolean(titleVisibility[2])}
      />
    </section>
  );
}

export default FeaturedProjectsSection;
