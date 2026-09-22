import { useEffect, useMemo, useRef } from "react";

import MainLogo from "../../../../assets/logos/MainLogo.jsx";
import ProjectImage from "../../../../components/ui/ProjectImage/ProjectImage.jsx";
import {
  canResumeCarouselAutoScroll,
  canWriteCarouselAutoScroll,
  shouldPauseCarouselAutoScroll,
} from "../utils/carouselAutoScroll.js";

const AUTO_SCROLL_SPEED_PX_PER_SECOND = 24;
const AUTO_SCROLL_RESUME_DELAY_MS = 1000;
const AUTO_SCROLL_POSITION_TOLERANCE_PX = 1;

function FeaturedProjectsMobileCarousel({ columns, galleryLabel }) {
  const carouselRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const pausedRef = useRef(false);
  const interactionActiveRef = useRef(false);
  const expectedScrollLeftRef = useRef(0);
  const firstSetRef = useRef(null);
  const secondSetRef = useRef(null);

  const repeatedColumns = useMemo(
    () => [
      { key: "primary", columns, ariaHidden: false },
      { key: "duplicate", columns, ariaHidden: true },
    ],
    [columns],
  );

  useEffect(() => {
    const carousel = carouselRef.current;
    const firstSet = firstSetRef.current;
    const secondSet = secondSetRef.current;

    if (!carousel || !firstSet || !secondSet) return undefined;

    let animationFrame = 0;
    let previousTimestamp = null;
    expectedScrollLeftRef.current = carousel.scrollLeft;

    carousel.addEventListener("scroll", handleCarouselScroll, {
      passive: true,
    });
    carousel.addEventListener("scrollend", handleCarouselScrollEnd);

    const getLoopDistance = () => secondSet.offsetLeft - firstSet.offsetLeft;

    const animate = (timestamp) => {
      if (previousTimestamp === null) previousTimestamp = timestamp;

      const elapsedSeconds = Math.min(
        (timestamp - previousTimestamp) / 1000,
        0.05,
      );
      previousTimestamp = timestamp;

      if (
        !pausedRef.current &&
        shouldPauseCarouselAutoScroll({
          currentScrollLeft: carousel.scrollLeft,
          expectedScrollLeft: expectedScrollLeftRef.current,
          interactionActive: interactionActiveRef.current,
          paused: false,
          tolerance: AUTO_SCROLL_POSITION_TOLERANCE_PX,
        })
      ) {
        pauseAutoScroll();
        expectedScrollLeftRef.current = carousel.scrollLeft;
        scheduleAutoScrollResume();
      }

      if (canWriteCarouselAutoScroll({
        interactionActive: interactionActiveRef.current,
        paused: pausedRef.current,
      })) {
        const loopDistance = getLoopDistance();

        if (loopDistance > 0) {
          carousel.scrollLeft +=
            AUTO_SCROLL_SPEED_PX_PER_SECOND * elapsedSeconds;

          if (carousel.scrollLeft >= loopDistance) {
            carousel.scrollLeft -= loopDistance;
          }

          expectedScrollLeftRef.current = carousel.scrollLeft;
        }
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(resumeTimerRef.current);
      carousel.removeEventListener("scroll", handleCarouselScroll);
      carousel.removeEventListener("scrollend", handleCarouselScrollEnd);
    };
  }, [columns]);

  const pauseAutoScroll = () => {
    pausedRef.current = true;
    window.clearTimeout(resumeTimerRef.current);
  };

  const scheduleAutoScrollResume = () => {
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      const carousel = carouselRef.current;
      if (
        !carousel ||
        !canResumeCarouselAutoScroll({
          interactionActive: interactionActiveRef.current,
          scrollSettled: true,
        })
      ) return;

      expectedScrollLeftRef.current = carousel.scrollLeft;
      pausedRef.current = false;
    }, AUTO_SCROLL_RESUME_DELAY_MS);
  };

  const beginUserInteraction = () => {
    interactionActiveRef.current = true;
    pauseAutoScroll();
  };

  const endUserInteraction = () => {
    interactionActiveRef.current = false;
    scheduleAutoScrollResume();
  };

  function handleCarouselScroll() {
    const carousel = carouselRef.current;
    if (!carousel) return;

    if (!shouldPauseCarouselAutoScroll({
      currentScrollLeft: carousel.scrollLeft,
      expectedScrollLeft: expectedScrollLeftRef.current,
      interactionActive: interactionActiveRef.current,
      paused: pausedRef.current,
      tolerance: AUTO_SCROLL_POSITION_TOLERANCE_PX,
    })) return;

    pausedRef.current = true;
    expectedScrollLeftRef.current = carousel.scrollLeft;
    scheduleAutoScrollResume();
  }

  function handleCarouselScrollEnd() {
    if (!pausedRef.current || interactionActiveRef.current) return;
    scheduleAutoScrollResume();
  }

  return (
    <div
      ref={carouselRef}
      aria-label={galleryLabel}
      className="flex h-full touch-pan-x items-start gap-[16px] overflow-x-auto overscroll-x-contain px-[16px] pt-[48px] pb-[var(--spacing-gap-9)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[768px]:gap-[16px] min-[768px]:px-[24px] min-[768px]:py-[32px]"
      data-featured-gallery-carousel
      data-native-horizontal-scroll
      onPointerDown={beginUserInteraction}
      onPointerUp={endUserInteraction}
      onPointerCancel={endUserInteraction}
      onTouchStart={beginUserInteraction}
      onTouchEnd={endUserInteraction}
      onTouchCancel={endUserInteraction}
      role="region"
    >
      {repeatedColumns.map((set, setIndex) => (
        <div
          ref={setIndex === 0 ? firstSetRef : secondSetRef}
          aria-hidden={set.ariaHidden ? "true" : undefined}
          className="flex shrink-0 gap-[16px]"
          data-featured-gallery-carousel-set
          key={set.key}
        >
          {set.columns.map((cards, columnIndex) => (
            <div
              className="flex shrink-0 gap-[24px] min-[768px]:gap-[16px]"
              data-featured-gallery-carousel-group
              key={columnIndex}
            >
              {cards.map((image, imageIndex) => (
                <div
                  className="relative h-[500px] w-[300px] shrink-0 overflow-hidden rounded-[var(--radius-2)] min-[768px]:h-[416px] min-[768px]:w-[42vw]"
                  data-featured-gallery-carousel-card
                  key={`${image.src}-${imageIndex}`}
                >
                  <ProjectImage
                    {...image}
                    revealOnLoad={false}
                    showLoader={false}
                    className="pointer-events-none flex h-full w-full items-center justify-center"
                  />
                  <MainLogo
                    size="20px"
                    appearance="dark"
                    alt=""
                    className="pointer-events-none absolute left-[16px] top-[16px]"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default FeaturedProjectsMobileCarousel;
