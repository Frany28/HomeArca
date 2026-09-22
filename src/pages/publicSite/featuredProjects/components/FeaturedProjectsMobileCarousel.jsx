import { useEffect, useMemo, useRef } from "react";

import MainLogo from "../../../../assets/logos/MainLogo.jsx";
import ProjectImage from "../../../../components/ui/ProjectImage/ProjectImage.jsx";
import {
  advanceCarouselAutoPosition,
  canResumeCarouselAutoScroll,
  canWriteCarouselAutoScroll,
  normalizeCarouselLoopPosition,
  resolveCarouselGestureAxis,
  smoothCarouselDragPosition,
} from "../utils/carouselAutoScroll.js";

const AUTO_SCROLL_SPEED_PX_PER_SECOND = 24;
const AUTO_SCROLL_RESUME_DELAY_MS = 700;

function FeaturedProjectsMobileCarousel({ columns, galleryLabel }) {
  const carouselRef = useRef(null);
  const trackRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const pausedRef = useRef(false);
  const interactionActiveRef = useRef(false);
  const autoPositionRef = useRef(0);
  const renderedPositionRef = useRef(0);
  const dragRef = useRef(null);
  const dragTargetPositionRef = useRef(null);
  const dragSettlingRef = useRef(false);
  const firstSetRef = useRef(null);
  const secondSetRef = useRef(null);

  const scheduleAutoScrollResume = () => {
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      if (
        !carouselRef.current ||
        !canResumeCarouselAutoScroll({
          interactionActive: interactionActiveRef.current,
          scrollSettled: true,
        })
      ) {
        return;
      }

      pausedRef.current = false;
    }, AUTO_SCROLL_RESUME_DELAY_MS);
  };

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
    const track = trackRef.current;

    if (!track) return;

    const normalized = normalizeCarouselLoopPosition(
      position,
      getLoopDistance(),
    );

    renderedPositionRef.current = position;
    autoPositionRef.current = normalized;
    track.style.transform = `translate3d(${-normalized}px, 0, 0)`;
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    const track = trackRef.current;

    if (
      !carousel ||
      !track ||
      !firstSetRef.current ||
      !secondSetRef.current
    ) {
      return undefined;
    }

    let animationFrame = 0;
    let previousTimestamp = null;
    autoPositionRef.current = 0;
    writeCarouselPosition(0);

    const animate = (timestamp) => {
      if (previousTimestamp === null) {
        previousTimestamp = timestamp;
      }

      const elapsedSeconds = Math.min(
        (timestamp - previousTimestamp) / 1000,
        0.05,
      );
      previousTimestamp = timestamp;

      const drag = dragRef.current;
      const dragTarget = dragTargetPositionRef.current;
      const smoothingHorizontalDrag =
        Number.isFinite(dragTarget) &&
        (drag?.axis === "horizontal" || dragSettlingRef.current);

      if (smoothingHorizontalDrag) {
        const nextPosition = smoothCarouselDragPosition(
          renderedPositionRef.current,
          dragTarget,
          elapsedSeconds,
        );

        if (
          dragSettlingRef.current &&
          Math.abs(dragTarget - nextPosition) <= 0.35
        ) {
          writeCarouselPosition(dragTarget);
          dragSettlingRef.current = false;
          dragTargetPositionRef.current = null;
          interactionActiveRef.current = false;
          scheduleAutoScrollResume();
        } else {
          writeCarouselPosition(nextPosition);
        }
      } else if (
        canWriteCarouselAutoScroll({
          interactionActive: interactionActiveRef.current,
          paused: pausedRef.current,
        })
      ) {
        const loopDistance = getLoopDistance();

        if (loopDistance > 0) {
          writeCarouselPosition(
            advanceCarouselAutoPosition(
              autoPositionRef.current,
              elapsedSeconds,
              loopDistance,
              AUTO_SCROLL_SPEED_PX_PER_SECOND,
            ),
          );
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

  const finishUserInteraction = () => {
    interactionActiveRef.current = false;
    dragRef.current = null;
    dragSettlingRef.current = false;
    dragTargetPositionRef.current = null;
    scheduleAutoScrollResume();
  };

  const handlePointerDown = (event) => {
    if (
      !carouselRef.current ||
      event.pointerType === "mouse" ||
      !event.isPrimary
    ) {
      return;
    }

    interactionActiveRef.current = true;
    dragSettlingRef.current = false;
    pauseAutoScroll();

    dragTargetPositionRef.current = renderedPositionRef.current;
    dragRef.current = {
      axis: null,
      pointerId: event.pointerId,
      startPosition: renderedPositionRef.current,
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
     * This element is not a scroll container. Vertical pan belongs to the
     * Home scroller; only a clearly horizontal gesture translates the track.
     */
    if (drag.axis !== "horizontal") return;

    dragTargetPositionRef.current =
      drag.startPosition - deltaX;
  };

  const handlePointerEnd = (event) => {
    const drag = dragRef.current;

    if (drag && drag.pointerId !== event.pointerId) return;

    if (
      drag?.axis === "horizontal" &&
      Number.isFinite(dragTargetPositionRef.current)
    ) {
      dragRef.current = null;
      dragSettlingRef.current = true;
      return;
    }

    finishUserInteraction();
  };

  return (
    <div
      ref={carouselRef}
      aria-label={galleryLabel}
      className="h-full touch-pan-y overflow-clip px-[var(--spacing-gap-5)] py-[var(--spacing-gap-8)] min-[768px]:px-[24px] min-[768px]:py-[32px]"
      data-featured-gallery-carousel
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      role="region"
    >
      <div
        ref={trackRef}
        className="flex h-full w-max items-start gap-[var(--spacing-gap-7)] will-change-transform min-[768px]:gap-[16px]"
        data-featured-gallery-carousel-track
      >
        {repeatedColumns.map((set, setIndex) => (
          <div
            ref={setIndex === 0 ? firstSetRef : secondSetRef}
            aria-hidden={set.ariaHidden ? "true" : undefined}
            className="flex shrink-0 gap-[var(--spacing-gap-7)] min-[768px]:gap-[16px]"
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
    </div>
  );
}

export default FeaturedProjectsMobileCarousel;
