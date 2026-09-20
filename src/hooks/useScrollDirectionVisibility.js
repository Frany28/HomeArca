import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

const NAVBAR_SCROLL_DURATION_SECONDS = 0.2;
const SCROLLABLE_OVERFLOW_PATTERN = /(auto|scroll|overlay)/;

function getClosestScrollContainer(element) {
  let ancestor = element?.parentElement;

  while (ancestor && ancestor !== document.body) {
    const { overflowY } = window.getComputedStyle(ancestor);
    if (SCROLLABLE_OVERFLOW_PATTERN.test(overflowY)) return ancestor;
    ancestor = ancestor.parentElement;
  }

  return window;
}

function useScrollDirectionVisibility(targetRef, { scrollContainerRef } = {}) {
  const reduceMotion = useReducedMotion();

  // Espera a que React asigne también las refs de los contenedores ancestros.
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return undefined;

    if (reduceMotion) {
      gsap.set(target, { clearProps: "transform" });
      return undefined;
    }

    const scrollContainer =
      scrollContainerRef?.current ?? getClosestScrollContainer(target);
    let removeInputListeners;
    const context = gsap.context(() => {
      const showAnimation = gsap
        .from(target, {
          yPercent: -100,
          paused: true,
          duration: NAVBAR_SCROLL_DURATION_SECONDS,
          ease: "power1.out",
        })
        .progress(1);

      let upwardIntent = false;
      let focusInside = false;
      let pointerFocus = false;
      const handleFocusIn = () => { focusInside = !pointerFocus; showAnimation.play(); };
      const handleFocusOut = (event) => {
        focusInside = !pointerFocus && Boolean(target.contains(event.relatedTarget));
      };
      target.addEventListener("focusin", handleFocusIn);
      target.addEventListener("focusout", handleFocusOut);
      let touchPoint = null;
      const reactToDirection = (delta) => {
        if (!delta) return;
        upwardIntent = delta < 0;
        if (upwardIntent || focusInside) showAnimation.play();
        else showAnimation.reverse();
      };
      const handleWheel = (event) => {
        if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        reactToDirection(event.deltaY);
      };
      const handlePointerDown = (event) => {
        pointerFocus = true;
        focusInside = false;
        upwardIntent = false;
        touchPoint = event.pointerType === "touch" && event.isPrimary
          ? { id: event.pointerId, x: event.clientX, y: event.clientY }
          : null;
      };
      const handlePointerMove = (event) => {
        if (touchPoint?.id !== event.pointerId) return;
        const deltaY = touchPoint.y - event.clientY;
        const deltaX = touchPoint.x - event.clientX;
        touchPoint = { id: event.pointerId, x: event.clientX, y: event.clientY };
        if (Math.abs(deltaY) > Math.abs(deltaX)) reactToDirection(deltaY);
      };
      const clearPointer = () => { touchPoint = null; };
      const handleKeyDown = (event) => {
        pointerFocus = false;
        if (target.contains(event.target)) focusInside = true;
        if (event.target?.closest?.('input, textarea, select, button, [contenteditable="true"], [role="tab"]')) return;
        if (["ArrowUp", "PageUp", "Home"].includes(event.key) || (event.key === " " && event.shiftKey)) {
          reactToDirection(-1);
        } else if (["ArrowDown", "PageDown", "End", " "].includes(event.key)) {
          reactToDirection(1);
        }
      };
      const inputListeners = {
        wheel: handleWheel, pointerdown: handlePointerDown,
        pointermove: handlePointerMove, pointerup: clearPointer,
        pointercancel: clearPointer, keydown: handleKeyDown,
      };
      const readScrollTop = () => scrollContainer === window
        ? (window.scrollY ?? 0) : (scrollContainer.scrollTop ?? 0);
      let previousScrollTop = readScrollTop();
      const handleNativeScroll = () => {
        const currentScrollTop = readScrollTop();
        const delta = currentScrollTop - previousScrollTop;
        previousScrollTop = currentScrollTop;
        if (!delta) return;
        if (focusInside || upwardIntent || currentScrollTop <= 0 || delta < 0) showAnimation.play();
        else showAnimation.reverse();
      };
      // Las secciones montadas después de la introducción pueden ampliar el
      // rango de scroll más allá del máximo calculado inicialmente por GSAP.
      scrollContainer.addEventListener("scroll", handleNativeScroll, { passive: true });
      // Captura la intención aunque Home consuma el gesto sin mover scrollTop.
      for (const [type, handler] of Object.entries(inputListeners)) {
        scrollContainer.addEventListener(type, handler, { capture: true, passive: true });
      }
      removeInputListeners = () => {
        scrollContainer.removeEventListener("scroll", handleNativeScroll);
        target.removeEventListener("focusin", handleFocusIn);
        target.removeEventListener("focusout", handleFocusOut);
        for (const [type, handler] of Object.entries(inputListeners)) {
          scrollContainer.removeEventListener(type, handler, true);
        }
      };

      ScrollTrigger.create({
        scroller: scrollContainer === window ? undefined : scrollContainer,
        start: 0,
        end: "max",
        onUpdate: (self) => {
          if (focusInside || upwardIntent || self.scroll() <= 0 || self.direction === -1) {
            showAnimation.play();
          } else {
            showAnimation.reverse();
          }
        },
      });
    }, target);

    return () => {
      removeInputListeners?.();
      context.revert();
    };
  }, [reduceMotion, scrollContainerRef, targetRef]);
}

export {
  getClosestScrollContainer,
  NAVBAR_SCROLL_DURATION_SECONDS,
};
export default useScrollDirectionVisibility;
