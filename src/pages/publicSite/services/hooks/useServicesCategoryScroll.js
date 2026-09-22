import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";

const CATEGORY_CROSSFADE_DURATION = 0.2;
const AUTO_ROTATE_INTERVAL = 2000;

function useServicesCategoryScroll(
  sectionRef,
  layoutRef,
  categories,
  enabled = true,
) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedIndexRef = useRef(0);
  const selectRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const layout = layoutRef.current;
    if (!section || !layout || !categories.length || !enabled) return undefined;

    const tabs = [...section.querySelectorAll('[role="tab"]')];
    const slides = [...section.querySelectorAll("[data-category-slide]")];
    const indicator = section.querySelector("[data-category-indicator]");
    let autoRotateTimer;
    let disposed = false;

    const indicatorHeight = (index) => {
      if (index === 0) {
        return parseFloat(getComputedStyle(tabs[0]).lineHeight) * 1.6;
      }

      const nextTab = tabs[index + 1];
      return (
        (nextTab?.offsetTop ??
          tabs[index].offsetTop + tabs[index].offsetHeight / 2) -
        tabs[0].offsetTop
      );
    };

    const select = (index, immediate = false) => {
      const next = Math.max(0, Math.min(categories.length - 1, index));
      selectedIndexRef.current = next;
      setActiveIndex(next);
      const duration = reduceMotion || immediate
        ? 0
        : CATEGORY_CROSSFADE_DURATION;

      slides.forEach((slide, slideIndex) => {
        gsap.to(slide, {
          autoAlpha: slideIndex === next ? 1 : 0,
          duration,
          overwrite: true,
        });
      });
      gsap.to(indicator, {
        height: indicatorHeight(next),
        duration,
        overwrite: true,
      });
    };

    const clearAutoRotate = () => {
      clearTimeout(autoRotateTimer);
      autoRotateTimer = undefined;
    };

    const scheduleNext = () => {
      clearAutoRotate();
      if (disposed || categories.length < 2) return;

      autoRotateTimer = setTimeout(() => {
        autoRotateTimer = undefined;
        if (disposed) return;
        select((selectedIndexRef.current + 1) % categories.length);
        scheduleNext();
      }, AUTO_ROTATE_INTERVAL);
    };

    const selectAndRestart = (index) => {
      select(index);
      scheduleNext();
    };

    const context = gsap.context(
      () => select(selectedIndexRef.current, true),
      section,
    );
    selectRef.current = selectAndRestart;
    scheduleNext();

    const resize = () => {
      if (!disposed) {
        gsap.set(indicator, {
          height: indicatorHeight(selectedIndexRef.current),
        });
      }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(layout);
    document.fonts.ready.then(resize);

    return () => {
      disposed = true;
      clearAutoRotate();
      observer.disconnect();
      gsap.killTweensOf([...slides, indicator]);
      selectRef.current = null;
      context.revert();
    };
  }, [categories, enabled, layoutRef, reduceMotion, sectionRef]);

  const selectCategory = (index) => {
    if (index >= 0 && index < categories.length) {
      selectRef.current?.(index);
    }
  };

  return { activeIndex, selectCategory };
}

export default useServicesCategoryScroll;
