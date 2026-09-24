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
const GLARE_INTENSITY = 0.08;
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
  const glareRef = useRef(null);
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
    const glare = glareRef.current;

    if (!card || !glare) return undefined;

    gsap.set(card, {
      rotationX: 0,
      rotationY: 0,
      transformOrigin: "center center",
    });
    gsap.set(glare, { opacity: 0, x: 0, y: 0 });

    if (reduceMotion) return undefined;

    const rotateXTo = gsap.quickTo(card, "rotationX", {
      ease: "power3",
    });
    const rotateYTo = gsap.quickTo(card, "rotationY", {
      ease: "power3",
    });
    const glareXTo = gsap.quickTo(glare, "x", {
      duration: 0.36,
      ease: "power2.out",
    });
    const glareYTo = gsap.quickTo(glare, "y", {
      duration: 0.36,
      ease: "power2.out",
    });
    const glareOpacityTo = gsap.quickTo(glare, "opacity", {
      duration: 0.24,
      ease: "power2.out",
    });

    const resetTilt = () => {
      rotateXTo(0);
      rotateYTo(0);
      glareXTo(0);
      glareYTo(0);
      glareOpacityTo(0);
    };

    const applyTiltFromPoint = (clientX, clientY) => {
      const rect = card.getBoundingClientRect();
      const offsetX = clientX - (rect.left + rect.width / 2);
      const offsetY = clientY - (rect.top + rect.height / 2);
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
      glareXTo(offsetX * 0.47);
      glareYTo(offsetY * 0.47);
      glareOpacityTo(GLARE_INTENSITY);
    };

    const handlePointerMove = (event) => {
      if (event.pointerType === "touch") return;
      applyTiltFromPoint(event.clientX, event.clientY);
    };

    const handleWindowPointerOut = (event) => {
      if (event.pointerType === "touch" || event.relatedTarget) return;
      resetTilt();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerout", handleWindowPointerOut);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handleWindowPointerOut);
      gsap.killTweensOf(card);
      gsap.killTweensOf(glare);
    };
  }, [reduceMotion]);

  return (
    <div className="contact-tilt-card w-full max-w-[432px] shrink-0 max-[767px]:max-w-[343px] max-[767px]:justify-self-center">
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
          ref={glareRef}
          className="contact-tilt-card__glare pointer-events-none absolute z-10 will-change-transform"
          aria-hidden="true"
        />

        <div
          className="contact-tilt-card__logo pointer-events-none absolute z-20 overflow-hidden"
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
