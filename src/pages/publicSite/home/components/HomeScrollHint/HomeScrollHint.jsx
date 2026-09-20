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

function HomeScrollHint() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute bottom-0 left-1/2 z-[6] flex w-[279px] -translate-x-1/2 flex-col items-center justify-center gap-[16px] p-[56px] text-[var(--color-neutral-100-uniform)]"
      data-node-id="5074:27083"
    >
      <p
        className="text-body-1 m-0 shrink-0 whitespace-nowrap"
        data-node-id="5074:27084"
      >
        Desliza para ver más
      </p>
      <Motion.div
        className="relative size-[32px] shrink-0"
        data-node-id="5074:27095"
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
