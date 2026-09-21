import { useEffect, useMemo, useRef } from "react";

import MainLogo from "../../../../assets/logos/MainLogo.jsx";
import ProjectImage from "../../../../components/ui/ProjectImage/ProjectImage.jsx";

const AUTO_SCROLL_SPEED_PX_PER_SECOND = 24;
const AUTO_SCROLL_RESUME_DELAY_MS = 1000;

function FeaturedProjectsMobileCarousel({ columns, galleryLabel }) {
  const carouselRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const pausedRef = useRef(false);
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

    const getLoopDistance = () => secondSet.offsetLeft - firstSet.offsetLeft;

    const animate = (timestamp) => {
      if (previousTimestamp === null) previousTimestamp = timestamp;

      const elapsedSeconds = Math.min(
        (timestamp - previousTimestamp) / 1000,
        0.05,
      );
      previousTimestamp = timestamp;

      if (!pausedRef.current) {
        const loopDistance = getLoopDistance();

        if (loopDistance > 0) {
          carousel.scrollLeft +=
            AUTO_SCROLL_SPEED_PX_PER_SECOND * elapsedSeconds;

          if (carousel.scrollLeft >= loopDistance) {
            carousel.scrollLeft -= loopDistance;
          }
        }
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(resumeTimerRef.current);
    };
  }, [columns]);

  const pauseAutoScroll = () => {
    pausedRef.current = true;
    window.clearTimeout(resumeTimerRef.current);
  };

  const resumeAutoScroll = () => {
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, AUTO_SCROLL_RESUME_DELAY_MS);
  };

  return (
    <div
      ref={carouselRef}
      aria-label={galleryLabel}
      className="flex h-full touch-pan-y items-start gap-[16px] overflow-x-auto overscroll-x-contain px-[16px] pt-[48px] pb-[var(--spacing-gap-9)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[768px]:gap-[16px] min-[768px]:px-[24px] min-[768px]:py-[32px]"
      data-featured-gallery-carousel
      onPointerDown={pauseAutoScroll}
      onPointerUp={resumeAutoScroll}
      onPointerCancel={resumeAutoScroll}
      onTouchEnd={resumeAutoScroll}
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
                    className="flex h-full w-full items-center justify-center"
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
