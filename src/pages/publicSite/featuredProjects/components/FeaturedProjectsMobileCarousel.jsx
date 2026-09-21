import { useEffect, useMemo, useRef } from "react";

import MainLogo from "../../../../assets/logos/MainLogo.jsx";
import ProjectImage from "../../../../components/ui/ProjectImage/ProjectImage.jsx";

const AUTO_SCROLL_SPEED_PX_PER_SECOND = 24;
const AUTO_SCROLL_RESUME_DELAY_MS = 1000;
const DRAG_EASING = 0.32;
const DRAG_MIN_VELOCITY_PX_PER_MS = 0.04;
const DRAG_MOMENTUM_FRICTION = 0.92;

function FeaturedProjectsMobileCarousel({ columns, galleryLabel }) {
  const carouselRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const pausedRef = useRef(false);
  const dragRef = useRef(null);
  const dragAnimationFrameRef = useRef(0);
  const momentumAnimationFrameRef = useRef(0);
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
      window.cancelAnimationFrame(dragAnimationFrameRef.current);
      window.cancelAnimationFrame(momentumAnimationFrameRef.current);
      window.clearTimeout(resumeTimerRef.current);
    };
  }, [columns]);

  const pauseAutoScroll = () => {
    pausedRef.current = true;
    window.clearTimeout(resumeTimerRef.current);
  };

  const stopMomentum = () => {
    window.cancelAnimationFrame(momentumAnimationFrameRef.current);
    momentumAnimationFrameRef.current = 0;
  };

  const handlePointerDown = (event) => {
    pauseAutoScroll();
    stopMomentum();

    if (event.pointerType !== "touch") return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: event.currentTarget.scrollLeft,
      targetScrollLeft: event.currentTarget.scrollLeft,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      horizontal: false,
    };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;

    if (
      !drag ||
      event.pointerType !== "touch" ||
      drag.pointerId !== event.pointerId
    ) {
      return;
    }

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    if (!drag.horizontal) {
      if (Math.abs(deltaX) < 8) return;
      if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

      drag.horizontal = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }

    event.preventDefault();

    const elapsed = Math.max(1, event.timeStamp - drag.lastTime);
    drag.velocity = (drag.lastX - event.clientX) / elapsed;
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
    drag.targetScrollLeft = drag.startScrollLeft - deltaX;

    if (!dragAnimationFrameRef.current) {
      const smoothDrag = () => {
        const activeDrag = dragRef.current;
        const carousel = carouselRef.current;

        if (!activeDrag || !carousel || !activeDrag.horizontal) {
          dragAnimationFrameRef.current = 0;
          return;
        }

        const distance =
          activeDrag.targetScrollLeft - carousel.scrollLeft;

        carousel.scrollLeft += distance * DRAG_EASING;

        if (Math.abs(distance) > 0.5) {
          dragAnimationFrameRef.current =
            window.requestAnimationFrame(smoothDrag);
        } else {
          carousel.scrollLeft = activeDrag.targetScrollLeft;
          dragAnimationFrameRef.current = 0;
        }
      };

      dragAnimationFrameRef.current =
        window.requestAnimationFrame(smoothDrag);
    }
  };

  const startMomentum = (velocity) => {
    const carousel = carouselRef.current;
    if (
      !carousel ||
      Math.abs(velocity) < DRAG_MIN_VELOCITY_PX_PER_MS
    ) {
      return;
    }

    let currentVelocity = velocity * 16;

    const animateMomentum = () => {
      if (!carouselRef.current) {
        momentumAnimationFrameRef.current = 0;
        return;
      }

      carouselRef.current.scrollLeft += currentVelocity;
      currentVelocity *= DRAG_MOMENTUM_FRICTION;

      if (Math.abs(currentVelocity) >= 0.5) {
        momentumAnimationFrameRef.current =
          window.requestAnimationFrame(animateMomentum);
      } else {
        momentumAnimationFrameRef.current = 0;
      }
    };

    momentumAnimationFrameRef.current =
      window.requestAnimationFrame(animateMomentum);
  };

  const clearPointerDrag = (event, { withMomentum = false } = {}) => {
    const drag = dragRef.current;

    if (drag?.pointerId !== event.pointerId) return;

    window.cancelAnimationFrame(dragAnimationFrameRef.current);
    dragAnimationFrameRef.current = 0;

    if (drag.horizontal && withMomentum) {
      startMomentum(drag.velocity);
    }

    dragRef.current = null;
  };

  const resumeAutoScroll = () => {
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, AUTO_SCROLL_RESUME_DELAY_MS);
  };

  const handlePointerCancel = (event) => {
    clearPointerDrag(event);
    resumeAutoScroll();
  };

  return (
    <div
      ref={carouselRef}
      aria-label={galleryLabel}
      className="flex h-full touch-pan-y items-start gap-[16px] overflow-x-auto overscroll-x-contain px-[16px] pt-[48px] pb-[var(--spacing-gap-9)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[768px]:gap-[16px] min-[768px]:px-[24px] min-[768px]:py-[32px]"
      data-featured-gallery-carousel
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => {
        clearPointerDrag(event, { withMomentum: true });
        resumeAutoScroll();
      }}
      onPointerCancel={handlePointerCancel}
      onTouchEnd={resumeAutoScroll}
      onTouchCancel={resumeAutoScroll}
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
