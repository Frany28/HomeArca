import brickFacadePoster from "../../../assets/processes/process-01-brick-facade-poster.webp";
import brickFacadeWebm from "../../../assets/processes/process-01-brick-facade.webm";
import surfacePreparationPoster from "../../../assets/processes/process-02-surface-preparation-poster.webp";
import surfacePreparationWebm from "../../../assets/processes/process-02-surface-preparation.webm";
import wallFinishingPoster from "../../../assets/processes/process-03-wall-finishing-poster.webp";
import wallFinishingWebm from "../../../assets/processes/process-03-wall-finishing.webm";
import siteInspectionPoster from "../../../assets/processes/process-04-site-inspection-poster.webp";
import siteInspectionWebm from "../../../assets/processes/process-04-site-inspection.webm";
import materialPreparationPoster from "../../../assets/processes/process-05-material-preparation-poster.webp";
import materialPreparationWebm from "../../../assets/processes/process-05-material-preparation.webm";
import planReviewPoster from "../../../assets/processes/process-06-plan-review-poster.webp";
import planReviewWebm from "../../../assets/processes/process-06-plan-review.webm";
import installationDetailPoster from "../../../assets/processes/process-07-installation-detail-poster.webp";
import installationDetailWebm from "../../../assets/processes/process-07-installation-detail.webm";
import materialSelectionPoster from "../../../assets/processes/process-08-material-selection-poster.webp";
import materialSelectionWebm from "../../../assets/processes/process-08-material-selection.webm";
import siteCleanupPoster from "../../../assets/processes/process-09-site-cleanup-poster.webp";
import siteCleanupWebm from "../../../assets/processes/process-09-site-cleanup.webm";

const PROCESSES_HEADING = {
  eyebrow: "Nuestros Procesos",
  title: "Un proceso claro desde el primer contacto.",
  description:
    "Cada proyecto refleja una colaboración construida sobre comunicación, confianza y atención al detalle.",
};

const PROCESS_VIDEOS = [
  {
    id: "brick-facade",
    title: "Instalación de revestimiento",
    description: "Instalación y control del revestimiento exterior.",
    poster: brickFacadePoster,
    webm: brickFacadeWebm,
  },
  {
    id: "surface-preparation",
    title: "Preparación de superficies",
    description: "Preparación técnica previa a la aplicación del acabado.",
    poster: surfacePreparationPoster,
    webm: surfacePreparationWebm,
  },
  {
    id: "wall-finishing",
    title: "Aplicación de acabados",
    description: "Aplicación manual y revisión del acabado seleccionado.",
    poster: wallFinishingPoster,
    webm: wallFinishingWebm,
  },
  {
    id: "site-inspection",
    title: "Supervisión en obra",
    description: "Inspección del espacio durante la ejecución del proyecto.",
    poster: siteInspectionPoster,
    webm: siteInspectionWebm,
  },
  {
    id: "material-preparation",
    title: "Preparación de materiales",
    description: "Preparación de materiales para una instalación precisa.",
    poster: materialPreparationPoster,
    webm: materialPreparationWebm,
  },
  {
    id: "plan-review",
    title: "Revisión técnica",
    description: "Validación de planos y documentación técnica.",
    poster: planReviewPoster,
    webm: planReviewWebm,
  },
  {
    id: "installation-detail",
    title: "Control de detalles",
    description: "Comprobación de encuentros y terminaciones en obra.",
    poster: installationDetailPoster,
    webm: installationDetailWebm,
  },
  {
    id: "material-selection",
    title: "Selección de materiales",
    description: "Evaluación de muestras, tonos y combinaciones.",
    poster: materialSelectionPoster,
    webm: materialSelectionWebm,
  },
  {
    id: "site-cleanup",
    title: "Organización de la obra",
    description: "Gestión ordenada de materiales y residuos de ejecución.",
    poster: siteCleanupPoster,
    webm: siteCleanupWebm,
  },
];

export { PROCESSES_HEADING, PROCESS_VIDEOS };
