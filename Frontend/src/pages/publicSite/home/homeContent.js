import constructionHeroAsset from "../../../assets/home/arca-construction-worker-v2.webp";
import homeHeroAsset from "../../../assets/home/arca-home-hero.webp";
import interiorDesignHeroAsset from "../../../assets/home/arca-interior-design-hero.webp";
import statementVideoMp4Asset from "../../../assets/home/arca-statement-bg.mp4";
import statementVideoWebmAsset from "../../../assets/home/arca-statement-bg.webm";
import statementPosterAsset from "../../../assets/home/arca-statement-poster.webp";

const HOME_IMAGE_PANELS = Object.freeze([
  {
    captionDescriptionNodeId: "4681:2313",
    captionNodeId: "4681:2311",
    captionTitleNodeId: "4681:2312",
    description:
      "Oficina Taller de Reparaciones Marinas | Ciudad Ojeda, Venezuela.",
    image: homeHeroAsset,
    imageAlt: "Instalaciones industriales de ARCA Studio junto al mar",
    projectName: "Muelle Zulima",
    title: "Arquitectura",
  },
  {
    captionDescriptionNodeId: "4681:2328",
    captionNodeId: "4681:2326",
    captionTitleNodeId: "4681:2327",
    description:
      "Oficina Taller de Reparaciones Marinas | Ciudad Ojeda, Venezuela.",
    image: constructionHeroAsset,
    imageAlt: "Trabajador de ARCA Studio preparando una estructura metálica",
    projectName: "Muelle Zulima",
    title: "Construcción",
  },
  {
    captionDescriptionNodeId: "4681:2332",
    captionNodeId: "4681:2330",
    captionTitleNodeId: "4681:2331",
    description: "Proyecto residencial | Maracaibo, Venezuela.",
    image: interiorDesignHeroAsset,
    imageAlt: "Sala interior diseñada por ARCA Studio con iluminación ambiental",
    projectName: "Quinta Bella Vista",
    title: "Interiorismo",
  },
]);

const HOME_PRELOAD_IMAGES = Object.freeze(
  HOME_IMAGE_PANELS.map(({ image }) => image),
);

const HOME_STATEMENT = Object.freeze({
  mp4Source: statementVideoMp4Asset,
  phrase: "Piénsalo y lo hacemos realidad.",
  poster: statementPosterAsset,
  webmSource: statementVideoWebmAsset,
});

export { HOME_IMAGE_PANELS, HOME_PRELOAD_IMAGES, HOME_STATEMENT };
