import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "motion/react";

import secondaryLogoMark from "../../../../assets/logos/secondaryLogoParts/mark.svg";
import secondaryLogoRegistration from "../../../../assets/logos/secondaryLogoParts/registration.svg";
import secondaryLogoDate from "../../../../assets/logos/secondaryLogoParts/date.svg";
import { ShaderFill } from "./lib/custom-effect-runtime/index.jsx";
import {
  manifest as movingGradientManifest,
  render as renderMovingGradient,
  setup as setupMovingGradient,
} from "./lib/custom-effects/CodeComponentId_8ce92017e53431a2f04b3574f4ba7c98f6f55f1e_625.js";
import "./ContactTiltCard.css";

const TILT_INTENSITY = 12;
const TOUCH_HOLD_DELAY_MS = 180;
const TOUCH_HOLD_SLOP_PX = 10;

const MOVING_GRADIENT_SHADER = {
  setup: setupMovingGradient,
  render: renderMovingGradient,
  manifest: movingGradientManifest,
  params: {
    intensity: 3.9800000190734863,
    gradient: {
      stops: [
        {
          position: 0,
          color: { r: 1, g: 0.2666666667, b: 0.1921568627, a: 1 },
        },
        { position: 0.5, color: { r: 1, g: 1, b: 1, a: 1 } },
        {
          position: 1,
          color: {
            r: 0.1647058824,
            g: 0.1607843137,
            b: 0.1607843137,
            a: 1,
          },
        },
      ],
    },
    gradientBalance: 0,
    material: 0,
    morphSpeed: 3.740000009536743,
    detail: 0,
    twist: 0.03999999910593033,
    zoom: 72,
    gradientMethod: 0,
    warp: 0.25999999046325684,
    rotationSpeed: 12,
  },
};

function isAndroidTouchDevice() {
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined"
  ) {
    return false;
  }

  const coarseTouch =
    window.matchMedia?.("(hover: none) and (pointer: coarse)")?.matches ??
    false;
  const platform =
    navigator.userAgentData?.platform ??
    navigator.platform ??
    "";
  const userAgent = navigator.userAgent ?? "";

  return coarseTouch && /android/i.test(`${platform} ${userAgent}`);
}

function ContactTiltCard() {
  const cardRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [gradientRenderer, setGradientRenderer] = useState("fallback");

  useEffect(() => {
    let cancelled = false;
    const prefersCssGradient = isAndroidTouchDevice();

    if (
      typeof navigator === "undefined" ||
      !navigator.gpu ||
      prefersCssGradient
    ) {
      setGradientRenderer("fallback");
      return undefined;
    }

    navigator.gpu
      .requestAdapter()
      .then((adapter) => {
        if (!cancelled) {
          setGradientRenderer(adapter ? "shader" : "fallback");
        }
      })
      .catch(() => {
        if (!cancelled) setGradientRenderer("fallback");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const card = cardRef.current;

    if (!card) return undefined;

    gsap.set(card, {
      rotationX: 0,
      rotationY: 0,
      transformOrigin: "center center",
    });

    if (reduceMotion) return undefined;

    const rotateXTo = gsap.quickTo(card, "rotationX", {
      ease: "power3",
    });
    const rotateYTo = gsap.quickTo(card, "rotationY", {
      ease: "power3",
    });

    const resetTilt = () => {
      rotateXTo(0);
      rotateYTo(0);
    };

    const applyTiltFromPoint = (clientX, clientY) => {
      const viewportX = gsap.utils.clamp(
        0,
        1,
        clientX / Math.max(window.innerWidth, 1),
      );
      const viewportY = gsap.utils.clamp(
        0,
        1,
        clientY / Math.max(window.innerHeight, 1),
      );

      rotateXTo(
        gsap.utils.interpolate(TILT_INTENSITY, -TILT_INTENSITY, viewportY),
      );
      rotateYTo(
        gsap.utils.interpolate(-TILT_INTENSITY, TILT_INTENSITY, viewportX),
      );
    };

    let touchPointerId = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchActive = false;
    let touchHoldTimer = null;

    const clearTouchHoldTimer = () => {
      if (touchHoldTimer !== null) {
        window.clearTimeout(touchHoldTimer);
        touchHoldTimer = null;
      }
    };

    const finishTouchInteraction = (event) => {
      if (
        event?.pointerType === "touch" &&
        touchPointerId !== null &&
        event.pointerId !== touchPointerId
      ) {
        return;
      }

      clearTouchHoldTimer();

      if (
        touchPointerId !== null &&
        card.hasPointerCapture?.(touchPointerId)
      ) {
        card.releasePointerCapture(touchPointerId);
      }

      touchPointerId = null;
      touchActive = false;
      resetTilt();
    };

    const handleMouseMove = (event) => {
      if (event.pointerType === "touch") return;
      applyTiltFromPoint(event.clientX, event.clientY);
    };

    const handleWindowPointerOut = (event) => {
      if (event.pointerType === "touch" || event.relatedTarget) return;
      resetTilt();
    };

    const handlePointerDown = (event) => {
      if (event.pointerType !== "touch" || touchPointerId !== null) return;

      touchPointerId = event.pointerId;
      touchStartX = event.clientX;
      touchStartY = event.clientY;
      touchActive = false;

      touchHoldTimer = window.setTimeout(() => {
        if (touchPointerId !== event.pointerId) return;

        touchActive = true;
        card.setPointerCapture?.(event.pointerId);
        applyTiltFromPoint(event.clientX, event.clientY);
      }, TOUCH_HOLD_DELAY_MS);
    };

    const handleTouchMove = (event) => {
      if (
        event.pointerType !== "touch" ||
        event.pointerId !== touchPointerId
      ) {
        return;
      }

      if (!touchActive) {
        const distance = Math.hypot(
          event.clientX - touchStartX,
          event.clientY - touchStartY,
        );

        if (distance > TOUCH_HOLD_SLOP_PX) {
          clearTouchHoldTimer();
          touchPointerId = null;
        }

        return;
      }

      event.preventDefault();
      applyTiltFromPoint(event.clientX, event.clientY);
    };

    window.addEventListener("pointermove", handleMouseMove);
    window.addEventListener("pointerout", handleWindowPointerOut);
    card.addEventListener("pointerdown", handlePointerDown);
    card.addEventListener("pointermove", handleTouchMove);
    card.addEventListener("pointerup", finishTouchInteraction);
    card.addEventListener("pointercancel", finishTouchInteraction);

    return () => {
      clearTouchHoldTimer();
      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("pointerout", handleWindowPointerOut);
      card.removeEventListener("pointerdown", handlePointerDown);
      card.removeEventListener("pointermove", handleTouchMove);
      card.removeEventListener("pointerup", finishTouchInteraction);
      card.removeEventListener("pointercancel", finishTouchInteraction);
      gsap.killTweensOf(card);
    };
  }, [reduceMotion]);

  return (
    <div className="contact-tilt-card w-full max-w-[432px] shrink-0">
      <div
        ref={cardRef}
        className="contact-tilt-card__surface relative aspect-[432/264.779] w-full overflow-hidden rounded-[var(--radius-4)] bg-[var(--color-primary-500-uniform)] will-change-transform"
        data-node-id="5074:25773"
      >
        {gradientRenderer === "shader" ? (
          <ShaderFill
            className="contact-tilt-card__gradient pointer-events-none absolute inset-0"
            shader={MOVING_GRADIENT_SHADER}
            paused={reduceMotion}
            aria-hidden="true"
          />
        ) : (
          <div
            className="contact-tilt-card__gradient-fallback pointer-events-none absolute inset-0"
            aria-hidden="true"
          />
        )}

        <div
          className="contact-tilt-card__logo pointer-events-none absolute z-10 overflow-hidden"
          data-node-id="5074:25774"
        >
          <img
            src={secondaryLogoMark}
            alt="ARCA Studio"
            className="absolute inset-x-0 top-0 block h-[90.93%] w-full"
            draggable={false}
          />
          <img
            src={secondaryLogoRegistration}
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 left-[0.05%] block h-[5.1%] w-[23.35%]"
            draggable={false}
          />
          <img
            src={secondaryLogoDate}
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 right-[0.05%] block h-[5.1%] w-[15.28%]"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

export default ContactTiltCard;
