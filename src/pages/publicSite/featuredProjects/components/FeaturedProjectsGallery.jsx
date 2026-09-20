import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { motion as Motion, useReducedMotion } from "motion/react";
import { gsap } from "gsap";
import { ExpoScaleEase } from "gsap/EasePack";
import { Flip } from "gsap/Flip";

import MainLogo from "../../../../assets/logos/MainLogo.jsx";
import ProjectImage from "../../../../components/ui/ProjectImage/ProjectImage.jsx";
import mirror from "../../../../assets/featuredProjects/quinta-bella-vista-1.webp";
import bedroom from "../../../../assets/featuredProjects/quinta-bella-vista-2.webp";
import seating from "../../../../assets/featuredProjects/quinta-bella-vista-3.webp";
import living from "../../../../assets/featuredProjects/quinta-bella-vista-4.webp";
import bathroom from "../../../../assets/featuredProjects/quinta-bella-vista-5.webp";
import lighting from "../../../../assets/featuredProjects/quinta-bella-vista-6.webp";
import {
  getSectionRevealClip,
  getSectionRevealTransition,
} from "../../utils/sectionReveal.js";

const COLUMNS = [
  [
    { src: mirror, alt: "Espejos decorativos de Quinta Bella Vista" },
    { src: bedroom, alt: "Dormitorio de Quinta Bella Vista" },
  ],
  [
    { src: seating, alt: "Área de estar de Quinta Bella Vista" },
    { src: lighting, alt: "Iluminación y bloques de vidrio de Quinta Bella Vista" },
  ],
  [
    { src: living, alt: "Sala de Quinta Bella Vista" },
    { src: bathroom, alt: "Baño de Quinta Bella Vista" },
  ],
];

const PRIMARY_CARD_ID = "1-1";

gsap.registerPlugin(ExpoScaleEase, Flip);

function clampProgress(progress) {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(Math.max(progress, 0), 1);
}

function FeaturedProjectsImageContent({
  alt,
  fit = "cover",
  imageClassName,
  src,
}) {
  return (
    <>
      <ProjectImage
        src={src}
        alt={alt}
        fit={fit}
        imageClassName={imageClassName}
        revealOnLoad={false}
        showLoader={false}
        className="flex h-full w-full items-center justify-center"
      />
      <MainLogo
        size="20px"
        appearance="dark"
        alt=""
        className="pointer-events-none absolute left-[16px] top-[16px]"
      />
    </>
  );
}

function FeaturedProjectsGalleryCard({
  cardId,
  image,
  primary,
  setCardRef,
  stage = false,
}) {
  return (
    <div
      ref={(element) => setCardRef(cardId, element)}
      data-featured-gallery-card
      data-card-id={cardId}
      data-featured-gallery-primary={primary ? "" : undefined}
      data-featured-gallery-overlay={stage && primary ? "" : undefined}
      data-featured-gallery-stage-card={stage ? "" : undefined}
      className="relative size-full overflow-hidden rounded-[var(--radius-2)]"
    >
      <FeaturedProjectsImageContent {...image} />
    </div>
  );
}

function FeaturedProjectsGallery({
  active = false,
  backgroundClassName = "bg-[var(--color-primary-500-uniform)]",
  columns = COLUMNS,
  containerClassName = "h-[1024px] shrink-0",
  expansionProgress,
  galleryLabel = "Galería de Quinta Bella Vista",
  onRevealComplete,
  preparationOffset,
  sectionReveal = true,
  visible = true,
}) {
  const cardRefs = useRef(new Map());
  const stageCardRefs = useRef(new Map());
  const gridRef = useRef(null);
  const stageGridRef = useRef(null);
  const stageColumnRefs = useRef(new Map());
  const stageRef = useRef(null);
  const flipContextRef = useRef(null);
  const flipTimelineRef = useRef(null);
  const renderedProgressRef = useRef(0);
  const resizeFrameRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const setCardRef = useCallback((cardId, element) => {
    if (element) cardRefs.current.set(cardId, element);
    else cardRefs.current.delete(cardId);
  }, []);

  const setStageCardRef = useCallback((cardId, element) => {
    if (element) stageCardRefs.current.set(cardId, element);
    else stageCardRefs.current.delete(cardId);
  }, []);

  const setStageColumnRef = useCallback((column, element) => {
    if (element) stageColumnRefs.current.set(column, element);
    else stageColumnRefs.current.delete(column);
  }, []);

  const showOriginalCards = useCallback(() => {
    cardRefs.current.forEach((card) => {
      card.style.removeProperty("visibility");
    });
  }, []);

  const hideOriginalCards = useCallback(() => {
    cardRefs.current.forEach((card) => {
      card.style.visibility = "hidden";
    });
  }, []);

  const clearFlipTimeline = useCallback(() => {
    flipContextRef.current?.revert();
    flipContextRef.current = null;
    flipTimelineRef.current = null;
    gsap.set(stageGridRef.current, { clearProps: "all" });
    stageColumnRefs.current.forEach((column) => {
      gsap.set(column, { clearProps: "all" });
    });
    stageCardRefs.current.forEach((card) => {
      gsap.set(card, { clearProps: "all" });
    });
  }, []);

  const createFlipTimeline = useCallback((rawProgress) => {
    const stage = stageRef.current;
    const sourceGrid = gridRef.current;
    const stageGrid = stageGridRef.current;
    const stageCards = [...stageCardRefs.current.values()];
    const stageColumns = [...stageColumnRefs.current.entries()];

    if (
      !stage ||
      !sourceGrid ||
      !stageGrid ||
      stageCards.length === 0 ||
      stageCards.length !== cardRefs.current.size ||
      stageColumns.length !== columns.length
    ) return false;

    clearFlipTimeline();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const sourceRect = sourceGrid.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const preparedStageTop = stageRect.top + (preparationOffset?.get?.() ?? 0);
    const sourceStyles = window.getComputedStyle(sourceGrid);
    const gap = Number.parseFloat(sourceStyles.columnGap) || 0;

    flipContextRef.current = gsap.context(() => {
      // El stage empieza como una copia geométrica del Bento visible.
      gsap.set(stageGrid, {
        height: sourceRect.height,
        left: sourceRect.left - stageRect.left,
        top: sourceRect.top - stageRect.top,
        width: sourceRect.width,
      });
      const initialGridStyle = stageGrid.style.cssText;
      const initialColumnStyles = new Map(
        stageColumns.map(([column, element]) => [column, element.style.cssText]),
      );

      // El estado final es otro layout de grid: las columnas laterales quedan
      // fuera por el crecimiento del Bento, no por destinos de cada tarjeta.
      gsap.set(stageGrid, {
        height: viewportHeight * 1.5 + gap,
        left: -(viewportWidth + gap) - stageRect.left,
        padding: 0,
        top: -(viewportHeight * 0.5 + gap) - preparedStageTop,
        width: viewportWidth * 3 + gap * 2,
        gridTemplateColumns: `repeat(3, ${viewportWidth}px)`,
      });
      stageColumns.forEach(([column, element]) => {
        gsap.set(element, {
          gridTemplateRows: column === 1
            ? `${viewportHeight * 0.5}px ${viewportHeight}px`
            : `${viewportHeight}px ${viewportHeight * 0.5}px`,
        });
      });
      gsap.set(stageCards, { borderRadius: 0 });

      const finalState = Flip.getState(stageCards, { props: "borderRadius" });

      stageGrid.style.cssText = initialGridStyle;
      stageColumns.forEach(([column, element]) => {
        element.style.cssText = initialColumnStyles.get(column) || "";
      });
      gsap.set(stageCards, { clearProps: "borderRadius" });

      flipTimelineRef.current = Flip.to(finalState, {
        duration: 1,
        ease: reduceMotion ? "none" : "expoScale(1, 5)",
        paused: true,
        simple: true,
      });
    }, stage);

    flipTimelineRef.current?.progress(clampProgress(rawProgress), false);
    return Boolean(flipTimelineRef.current);
  }, [clearFlipTimeline, columns.length, preparationOffset, reduceMotion]);

  const renderExpansion = useCallback((rawProgress) => {
    const progress = clampProgress(rawProgress);
    const stage = stageRef.current;

    if (!stage || progress <= 0) {
      if (stage) {
        stage.style.visibility = "hidden";
      }

      clearFlipTimeline();
      showOriginalCards();
      renderedProgressRef.current = progress;
      return;
    }

    const needsFreshLayout = !flipTimelineRef.current;

    if (needsFreshLayout && !createFlipTimeline(progress)) {
      stage.style.visibility = "hidden";
      showOriginalCards();
      renderedProgressRef.current = progress;
      return;
    }

    flipTimelineRef.current?.progress(progress, false);
    if (active) {
      hideOriginalCards();
      stage.style.visibility = "visible";
    } else {
      stage.style.visibility = "hidden";
      showOriginalCards();
    }
    renderedProgressRef.current = progress;
    }, [
    active,
    clearFlipTimeline,
    createFlipTimeline,
    hideOriginalCards,
    showOriginalCards,
  ]);

  useLayoutEffect(() => {
    renderExpansion(expansionProgress?.get?.() ?? 0);
  }, [active, columns, expansionProgress, renderExpansion]);

  useEffect(() => {
    if (!expansionProgress?.on) return undefined;
    return expansionProgress.on("change", renderExpansion);
  }, [expansionProgress, renderExpansion]);

  useEffect(() => {
    if (!preparationOffset?.on) return undefined;
    return preparationOffset.on("change", () => {
      if ((expansionProgress?.get?.() ?? 0) <= 0) {
        clearFlipTimeline();
      }
    });
  }, [clearFlipTimeline, expansionProgress, preparationOffset]);

  useEffect(() => {
    const handleResize = () => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
      }

      resizeFrameRef.current = window.requestAnimationFrame(() => {
        resizeFrameRef.current = null;
        const progress = clampProgress(expansionProgress?.get?.() ?? 0);
        if (progress > 0) createFlipTimeline(progress);
        renderExpansion(progress);
      });
    };
    const primaryCard = cardRefs.current.get(PRIMARY_CARD_ID);
    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(handleResize);

    if (primaryCard) resizeObserver?.observe(primaryCard);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [active, createFlipTimeline, expansionProgress, renderExpansion]);

  useEffect(() => () => {
    clearFlipTimeline();
    showOriginalCards();
  }, [clearFlipTimeline, showOriginalCards]);

  const stage = columns.length > 0 ? (
    <div
      ref={stageRef}
      aria-hidden="true"
      data-featured-gallery-stage
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      style={{ visibility: "hidden" }}
    >
      <div
        ref={stageGridRef}
        data-featured-gallery-stage-grid
        className="absolute mx-auto grid h-full w-full max-w-[1441px] grid-cols-3 gap-[24px] px-[24px] py-[48px] max-[767px]:gap-[8px] max-[767px]:px-[16px]"
      >
        {columns.map((cards, column) => (
          <div
            key={column}
            ref={(element) => setStageColumnRef(column, element)}
            className={`grid min-h-0 min-w-0 gap-[24px] max-[767px]:gap-[8px] ${column === 1 ? "grid-rows-[335fr_569fr]" : "grid-rows-[568fr_336fr]"}`}
          >
            {cards.map((image, row) => {
              const cardId = `${column}-${row}`;
              return (
                <FeaturedProjectsGalleryCard
                  key={cardId}
                  cardId={cardId}
                  image={image}
                  primary={cardId === PRIMARY_CARD_ID}
                  setCardRef={setStageCardRef}
                  stage
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <>
      <Motion.div
        data-featured-gallery
        data-featured-image-gallery
        data-node-id="4686:3913"
        role="group"
        aria-label={galleryLabel}
        aria-hidden={!visible}
        initial={false}
        animate={sectionReveal ? { clipPath: getSectionRevealClip(visible) } : undefined}
        transition={sectionReveal
          ? getSectionRevealTransition(visible, reduceMotion)
          : undefined}
        style={sectionReveal ? undefined : { clipPath: "inset(0 0 0 0)" }}
        onAnimationComplete={() => onRevealComplete?.(visible ? 2 : 1)}
        className={`relative ${containerClassName} overflow-hidden ${backgroundClassName}`}
      >
        {stage}
        <div ref={gridRef} className="mx-auto grid h-full w-full max-w-[1441px] grid-cols-3 gap-[24px] px-[24px] py-[48px] max-[767px]:gap-[8px] max-[767px]:px-[16px]">
          {columns.map((cards, column) => (
            <div
              key={column}
              className={`grid min-h-0 min-w-0 gap-[24px] max-[767px]:gap-[8px] ${column === 1 ? "grid-rows-[335fr_569fr]" : "grid-rows-[568fr_336fr]"}`}
            >
              {cards.map((image, row) => {
                const cardId = `${column}-${row}`;
                return (
                  <FeaturedProjectsGalleryCard
                    key={cardId}
                    cardId={cardId}
                    image={image}
                    primary={cardId === PRIMARY_CARD_ID}
                    setCardRef={setCardRef}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </Motion.div>
    </>
  );
}

export default FeaturedProjectsGallery;
