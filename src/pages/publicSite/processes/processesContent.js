import brickFacadeMp4 from "../../../assets/processes/process-01-brick-facade.mp4";
import brickFacadePoster from "../../../assets/processes/process-01-brick-facade-poster.webp";
import brickFacadeWebm from "../../../assets/processes/process-01-brick-facade.webm";
import surfacePreparationMp4 from "../../../assets/processes/process-02-surface-preparation.mp4";
import surfacePreparationPoster from "../../../assets/processes/process-02-surface-preparation-poster.webp";
import surfacePreparationWebm from "../../../assets/processes/process-02-surface-preparation.webm";
import wallFinishingMp4 from "../../../assets/processes/process-03-wall-finishing.mp4";
import wallFinishingPoster from "../../../assets/processes/process-03-wall-finishing-poster.webp";
import wallFinishingWebm from "../../../assets/processes/process-03-wall-finishing.webm";
import siteInspectionMp4 from "../../../assets/processes/process-04-site-inspection.mp4";
import siteInspectionPoster from "../../../assets/processes/process-04-site-inspection-poster.webp";
import siteInspectionWebm from "../../../assets/processes/process-04-site-inspection.webm";
import materialPreparationMp4 from "../../../assets/processes/process-05-material-preparation.mp4";
import materialPreparationPoster from "../../../assets/processes/process-05-material-preparation-poster.webp";
import materialPreparationWebm from "../../../assets/processes/process-05-material-preparation.webm";
import planReviewMp4 from "../../../assets/processes/process-06-plan-review.mp4";
import planReviewPoster from "../../../assets/processes/process-06-plan-review-poster.webp";
import planReviewWebm from "../../../assets/processes/process-06-plan-review.webm";
import installationDetailMp4 from "../../../assets/processes/process-07-installation-detail.mp4";
import installationDetailPoster from "../../../assets/processes/process-07-installation-detail-poster.webp";
import installationDetailWebm from "../../../assets/processes/process-07-installation-detail.webm";
import materialSelectionMp4 from "../../../assets/processes/process-08-material-selection.mp4";
import materialSelectionPoster from "../../../assets/processes/process-08-material-selection-poster.webp";
import materialSelectionWebm from "../../../assets/processes/process-08-material-selection.webm";
import siteCleanupMp4 from "../../../assets/processes/process-09-site-cleanup.mp4";
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
    mp4: brickFacadeMp4,
  },
  {
    id: "surface-preparation",
    title: "Preparación de superficies",
    description: "Preparación técnica previa a la aplicación del acabado.",
    poster: surfacePreparationPoster,
    webm: surfacePreparationWebm,
    mp4: surfacePreparationMp4,
  },
  {
    id: "wall-finishing",
    title: "Aplicación de acabados",
    description: "Aplicación manual y revisión del acabado seleccionado.",
    poster: wallFinishingPoster,
    webm: wallFinishingWebm,
    mp4: wallFinishingMp4,
  },
  {
    id: "site-inspection",
    title: "Supervisión en obra",
    description: "Inspección del espacio durante la ejecución del proyecto.",
    poster: siteInspectionPoster,
    webm: siteInspectionWebm,
    mp4: siteInspectionMp4,
  },
  {
    id: "material-preparation",
    title: "Preparación de materiales",
    description: "Preparación de materiales para una instalación precisa.",
    poster: materialPreparationPoster,
    webm: materialPreparationWebm,
    mp4: materialPreparationMp4,
  },
  {
    id: "plan-review",
    title: "Revisión técnica",
    description: "Validación de planos y documentación técnica.",
    poster: planReviewPoster,
    webm: planReviewWebm,
    mp4: planReviewMp4,
  },
  {
    id: "installation-detail",
    title: "Control de detalles",
    description: "Comprobación de encuentros y terminaciones en obra.",
    poster: installationDetailPoster,
    webm: installationDetailWebm,
    mp4: installationDetailMp4,
  },
  {
    id: "material-selection",
    title: "Selección de materiales",
    description: "Evaluación de muestras, tonos y combinaciones.",
    poster: materialSelectionPoster,
    webm: materialSelectionWebm,
    mp4: materialSelectionMp4,
  },
  {
    id: "site-cleanup",
    title: "Organización de la obra",
    description: "Gestión ordenada de materiales y residuos de ejecución.",
    poster: siteCleanupPoster,
    webm: siteCleanupWebm,
    mp4: siteCleanupMp4,
  },
];

export { PROCESSES_HEADING, PROCESS_VIDEOS };
