import muelleZulima1 from "../../../../assets/featuredProjects/muelle-zulima-1.webp";
import muelleZulima2 from "../../../../assets/featuredProjects/muelle-zulima-2.webp";
import muelleZulima3 from "../../../../assets/featuredProjects/muelle-zulima-3.webp";
import muelleZulima4 from "../../../../assets/featuredProjects/muelle-zulima-4.webp";
import muelleZulima5 from "../../../../assets/featuredProjects/muelle-zulima-5.webp";
import muelleZulima6 from "../../../../assets/featuredProjects/muelle-zulima-6.webp";
import aptoJc1 from "../../../../assets/featuredProjects/apto-jc-1.webp";
import aptoJc2 from "../../../../assets/featuredProjects/apto-jc-2.webp";
import aptoJc3 from "../../../../assets/featuredProjects/apto-jc-3.webp";
import aptoJc4 from "../../../../assets/featuredProjects/apto-jc-4.webp";
import aptoJc5 from "../../../../assets/featuredProjects/apto-jc-5.webp";
import aptoJc6 from "../../../../assets/featuredProjects/apto-jc-6.webp";
import FeaturedProjectsGallery from "./FeaturedProjectsGallery.jsx";
import SectionTitleReveal from "../../components/SectionTitleReveal.jsx";

const MUELLE_ZULIMA_COLUMNS = [
  [
    { src: muelleZulima1, alt: "Sala de reuniones de Muelle Zulima", width: 1920, height: 1080 },
    { src: muelleZulima2, alt: "Mobiliario de oficina de Muelle Zulima", width: 1920, height: 1080 },
  ],
  [
    { src: muelleZulima3, alt: "Estaciones de trabajo de Muelle Zulima", width: 1920, height: 1080 },
    { src: muelleZulima6, alt: "Área de trabajo de Muelle Zulima", width: 1920, height: 1080 },
  ],
  [
    { src: muelleZulima4, alt: "Oficina privada de Muelle Zulima", width: 1920, height: 1080 },
    { src: muelleZulima5, alt: "Espacios operativos de Muelle Zulima", width: 1920, height: 1080 },
  ],
];

const APTO_JC_COLUMNS = [
  [
    { src: aptoJc1, alt: "Baño remodelado del apartamento JC", width: 576, height: 1024, imageClassName: "object-bottom" },
    { src: aptoJc2, alt: "Detalle arquitectónico del apartamento JC", width: 1920, height: 1080 },
  ],
  [
    { src: aptoJc3, alt: "Baño principal del apartamento JC", width: 1024, height: 576, imageClassName: "object-bottom" },
    { src: aptoJc6, alt: "Acabados del baño del apartamento JC", width: 1024, height: 576 },
  ],
  [
    { src: aptoJc4, alt: "Espacio interior del apartamento JC", width: 576, height: 1024, imageClassName: "object-bottom" },
    { src: aptoJc5, alt: "Baño contemporáneo del apartamento JC", width: 1024, height: 576 },
  ],
];

const MUELLE_ZULIMA_PROJECT = {
  columns: MUELLE_ZULIMA_COLUMNS,
  description: "Diseño arquitectónico y ejecución de proyecto industrial para una oficina taller de reparaciones marinas ubicada en Ciudad Ojeda.",
  descriptionClassName: "max-w-[555px]",
  galleryLabel: "Galería de Muelle Zulima",
  headingClassName: "py-[var(--spacing-gap-7)]",
  id: "muelle-zulima",
  nodeId: "4686:114353",
  title: "Muelle Zulima",
};

const APTO_JC_PROJECT = {
  columns: APTO_JC_COLUMNS,
  description: "Diseño arquitectónico y ejecución de remodelación para los baños de una sofisticada residencia ubicada en Maracaibo.",
  descriptionClassName: "max-w-[560px]",
  galleryLabel: "Galería de Apto. JC",
  headingClassName: "py-[var(--spacing-gap-8)]",
  id: "apto-jc",
  nodeId: "4686:113503",
  title: "Apto. JC",
};

/**
 * Presenta un proyecto destacado dentro del ciclo vertical de la página.
 * Reutiliza el encabezado revelado y la galería compartida con sus datos
 * específicos para preservar la misma interacción entre todos los proyectos.
 */
function FeaturedProjectsProjectPanel({
  active = false,
  expansionProgress,
  preparationOffset,
  project = MUELLE_ZULIMA_PROJECT,
  titleVisible = false,
}) {
  return (
    <article
      data-featured-next-project={project.id}
      data-featured-project-panel
      data-content-title-scope={`featured-project-${project.id}`}
      data-node-id={project.nodeId}
      data-navbar-background="light"
      aria-label={`Proyecto destacado ${project.title}`}
      aria-hidden={!active}
      inert={active ? undefined : ""}
      className="relative flex min-h-0 flex-col gap-[var(--spacing-gap-7)] bg-[var(--color-neutral-100-uniform)] pt-[var(--spacing-gap-8)] text-[var(--color-primary-300)]"
    >
      <SectionTitleReveal
        visible={titleVisible}
        className={`mx-auto flex w-full shrink-0 max-w-[1200px] flex-col items-center gap-[24px] px-[16px] ${project.headingClassName} text-center min-[768px]:px-[var(--spacing-gap-7)]`}
        data-node-id={project.nodeId}
      >
        <p className="text-heading-4 m-0 w-full">
          Proyectos Destacados
        </p>
        <h2 className="text-heading-1 m-0 w-full max-[767px]:text-[38px] max-[767px]:leading-[46px]">
          {project.title}
        </h2>
        <p className={`text-heading-6 m-0 w-full ${project.descriptionClassName} opacity-60`}>
          {project.description}
        </p>
      </SectionTitleReveal>
      <FeaturedProjectsGallery
        active={active}
        backgroundClassName="bg-[var(--color-neutral-100-uniform)]"
        columns={project.columns}
        expansionProgress={expansionProgress}
        preparationOffset={preparationOffset}
        galleryLabel={project.galleryLabel}
      />
    </article>
  );
}

export { APTO_JC_PROJECT };
export default FeaturedProjectsProjectPanel;
