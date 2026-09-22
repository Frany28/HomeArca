import { useEffect, useMemo, useRef } from "react";

import MainLogo from "../../../../assets/logos/MainLogo.jsx";
import ProjectImage from "../../../../components/ui/ProjectImage/ProjectImage.jsx";
import {
  advanceCarouselAutoPosition,
  canResumeCarouselAutoScroll,
  canWriteCarouselAutoScroll,
  normalizeCarouselLoopPosition,
  resolveCarouselGestureAxis,
} from "../utils/carouselAutoScroll.js";

const AUTO_SCROLL_SPEED_PX_PER_SECOND = 24;
const AUTO_SCROLL_RESUME_DELAY_MS = 700;

function FeaturedProjectsMobileCarousel({ columns, galleryLabel }) {
  const carouselRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const pausedRef = useRef(false);
  const interactionActiveRef = useRef(false);
  const touchActiveRef = useRef(false);
  const autoPositionRef = useRef(0);
  const dragRef = useRef(null);
  const firstSetRef = useRef(null);
  const secondSetRef = useRef(null);

  const repeatedColumns = useMemo(
    () => [
      { key: "primary", columns, ariaHidden: false },
      { key: "duplicate", columns, ariaHidden: true },
    ],
    [columns],
  );

  const getLoopDistance = () => {
    const firstSet = firstSetRef.current;
    const secondSet = secondSetRef.current;

    if (!firstSet || !secondSet) return 0;

    return secondSet.offsetLeft - firstSet.offsetLeft;
  };

  const writeCarouselPosition = (position) => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    const normalized = normalizeCarouselLoopPosition(
      position,
      getLoopDistance(),
    );

    carousel.scrollLeft = normalized;
    autoPositionRef.current = normalized;
  };

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel || !firstSetRef.current || !secondSetRef.current) {
      return undefined;
    }

    let animationFrame = 0;
    let previousTimestamp = null;
    autoPositionRef.current = carousel.scrollLeft;

    carousel.addEventListener("scroll", handleCarouselScroll, {
      passive: true,
    });
    carousel.addEventListener("scrollend", handleCarouselScrollEnd);

    const animate = (timestamp) => {
      if (previousTimestamp === null) {
        previousTimestamp = timestamp;
      }

      const elapsedSeconds = Math.min(
        (timestamp - previousTimestamp) / 1000,
        0.05,
      );
      previousTimestamp = timestamp;

      if (
        canWriteCarouselAutoScroll({
          interactionActive: interactionActiveRef.current,
          paused: pausedRef.current,
        })
      ) {
        const loopDistance = getLoopDistance();

        if (loopDistance > 0) {
          autoPositionRef.current = advanceCarouselAutoPosition(
            autoPositionRef.current,
            elapsedSeconds,
            loopDistance,
            AUTO_SCROLL_SPEED_PX_PER_SECOND,
          );

          carousel.scrollLeft = autoPositionRef.current;
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
    const carousel = carouselRef.current;

    pausedRef.current = true;
    if (carousel) {
      autoPositionRef.current = carousel.scrollLeft;
    }
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
      ) {
        return;
      }

      autoPositionRef.current = carousel.scrollLeft;
      pausedRef.current = false;
    }, AUTO_SCROLL_RESUME_DELAY_MS);
  };

  const finishUserInteraction = () => {
    if (touchActiveRef.current) return;

    const carousel = carouselRef.current;

    interactionActiveRef.current = false;
    if (carousel) {
      autoPositionRef.current = carousel.scrollLeft;
    }

    scheduleAutoScrollResume();
  };

  const handlePointerDown = (event) => {
    const carousel = carouselRef.current;

    if (
      !carousel ||
      event.pointerType === "mouse" ||
      !event.isPrimary
    ) {
      return;
    }

    interactionActiveRef.current = true;
    pauseAutoScroll();

    dragRef.current = {
      axis: null,
      pointerId: event.pointerId,
      startScrollLeft: carousel.scrollLeft,
      startX: event.clientX,
      startY: event.clientY,
    };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    if (!drag.axis) {
      drag.axis = resolveCarouselGestureAxis(deltaX, deltaY);
    }

    /*
     * Vertical and ambiguous gestures never write scrollLeft. With touch-pan-y
     * the browser keeps full ownership of page scrolling and can continue into
     * the next/previous Home section.
     */
    if (drag.axis !== "horizontal") return;

    writeCarouselPosition(
      drag.startScrollLeft - deltaX,
    );
  };

  const handlePointerEnd = (event) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    finishUserInteraction();
  };

  const handlePointerCancel = (event) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    finishUserInteraction();
  };

  const handleTouchStart = () => {
    touchActiveRef.current = true;
    interactionActiveRef.current = true;
    pauseAutoScroll();
  };

  const handleTouchEnd = () => {
    touchActiveRef.current = false;
    dragRef.current = null;
    finishUserInteraction();
  };

  function handleCarouselScroll() {
    const carousel = carouselRef.current;

    if (
      !carousel ||
      !pausedRef.current ||
      interactionActiveRef.current
    ) {
      return;
    }

    autoPositionRef.current = carousel.scrollLeft;
    scheduleAutoScrollResume();
  }

  function handleCarouselScrollEnd() {
    const carousel = carouselRef.current;

    if (
      !carousel ||
      !pausedRef.current ||
      interactionActiveRef.current
    ) {
      return;
    }

    autoPositionRef.current = carousel.scrollLeft;
    scheduleAutoScrollResume();
  }

  return (
    <div
      ref={carouselRef}
      aria-label={galleryLabel}
      className="flex h-full touch-pan-y items-start gap-[16px] overflow-x-auto overscroll-x-contain px-[var(--spacing-gap-5)] py-[var(--spacing-gap-8)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[768px]:gap-[16px] min-[768px]:px-[24px] min-[768px]:py-[32px]"
      data-featured-gallery-carousel
      data-native-horizontal-scroll
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerCancel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
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
              className="flex shrink-0 gap-[var(--spacing-gap-7)] min-[768px]:gap-[16px]"
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
