import { motion as Motion, useReducedMotion } from "motion/react";

import scrollDownIcon from "../../../../../assets/home/scroll-down.svg";

const ICON_INITIAL_STATE = { opacity: 0.7, y: 0 };
const ICON_ANIMATION = {
  opacity: [0.7, 1, 0.7, 0.7],
  y: [0, 6, 0, 0],
};
const ICON_TRANSITION = {
  opacity: {
    duration: 2,
    times: [0, 0.3, 0.6, 1],
    ease: [[0.4, 0, 0.2, 1], [0.4, 0, 0.2, 1], "linear"],
    repeat: Infinity,
  },
  y: {
    duration: 2,
    times: [0, 0.3, 0.6, 1],
    ease: [[0.4, 0, 0.2, 1], [0.4, 0, 0.2, 1], "linear"],
    repeat: Infinity,
  },
};

const SCROLL_HINT_VARIANTS = {
  centered: {
    className:
      "top-1/2 left-1/2 w-[279px] -translate-x-1/2 items-center gap-[16px] p-[56px]",
    iconNodeId: "5074:27095",
    rootNodeId: "5074:27083",
    textNodeId: "5074:27084",
  },
  edge: {
    className:
      "right-[51px] bottom-[51px] size-[144px] items-end gap-[16px] p-[56px]",
    iconNodeId: "5169:16283",
    rootNodeId: "5169:16271",
  },
};

function HomeScrollHint({ variant = "centered" }) {
  const reduceMotion = useReducedMotion();
  const variantConfig = SCROLL_HINT_VARIANTS[variant];

  return (
    <div
      className={`pointer-events-none absolute z-[6] flex flex-col justify-center text-[var(--color-neutral-100-uniform)] ${variantConfig.className}`}
      data-node-id={variantConfig.rootNodeId}
    >
      {variantConfig.textNodeId && (
        <p
          className="text-body-1 m-0 shrink-0 whitespace-nowrap"
          data-node-id={variantConfig.textNodeId}
        >
          Desliza para ver más
        </p>
      )}
      <Motion.div
        className="relative size-[32px] shrink-0"
        data-node-id={variantConfig.iconNodeId}
        data-name="icons/scroll-down"
        initial={reduceMotion ? false : ICON_INITIAL_STATE}
        animate={reduceMotion ? undefined : ICON_ANIMATION}
        transition={reduceMotion ? undefined : ICON_TRANSITION}
        style={reduceMotion ? { opacity: 0.7 } : undefined}
      >
        <img
          src={scrollDownIcon}
          alt=""
          className="absolute inset-0 block size-full max-w-none"
        />
      </Motion.div>
    </div>
  );
}

export default HomeScrollHint;
