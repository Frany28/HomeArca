import { motion as Motion, useReducedMotion } from "motion/react";

import { getSectionRevealTransition, getSectionRevealClip, REVEAL_DELAY_SECONDS, REVEAL_DURATION_SECONDS } from "../../../utils/sectionReveal.js";
const REVEAL_HEIGHT_COLLAPSED = 57;
const REVEAL_HEIGHT_EXPANDED = 255;

function HomeHeroTitle({
  captionDescriptionNodeId,
  captionNodeId,
  captionTitleNodeId,
  description,
  projectName,
  title,
  visible,
  onRevealComplete,
}) {
  const reduceMotion = useReducedMotion();
  const revealTransition = getSectionRevealTransition(visible, reduceMotion);

  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      <div
        className="absolute inset-x-0 top-1/2 h-[385px] -translate-y-1/2 overflow-hidden"
        data-node-id="4848:6515"
      >
        <Motion.div
          className="absolute left-1/2 top-[65px] w-[min(1200px,calc(100%-32px))] -translate-x-1/2 overflow-hidden"
          initial={false}
          animate={{
            height: visible
              ? REVEAL_HEIGHT_EXPANDED
              : REVEAL_HEIGHT_COLLAPSED,
          }}
          transition={revealTransition}
          onAnimationComplete={() => {
            if (visible) {
              onRevealComplete?.();
            }
          }}
          data-node-id="4451:132680"
          aria-hidden={!visible}
        >
          <h1
            className="absolute left-1/2 top-[89.5px] m-0 w-[min(1104px,calc(100%-32px))] -translate-x-1/2 whitespace-nowrap text-center font-[var(--font-sans)] text-[clamp(40px,8vw,96px)] font-bold leading-[clamp(48px,6.33vw,76px)] tracking-[clamp(-2px,-0.139vw,-1px)] text-[var(--color-neutral-100-uniform)]"
            data-node-id="4451:132681"
          >
            {title}
          </h1>
        </Motion.div>
      </div>

      <Motion.div
        className="absolute bottom-0 left-1/2 flex w-max max-w-full -translate-x-1/2 flex-col items-center gap-[8px] px-[24px] py-[24px] text-center text-[var(--color-neutral-100-uniform)]"
        initial={false}
        animate={{ clipPath: getSectionRevealClip(visible) }}
        transition={revealTransition}
        data-node-id={captionNodeId}
        aria-hidden={!visible}
      >
        <p
          className="text-heading-7 m-0 max-w-full opacity-60"
          data-node-id={captionTitleNodeId}
        >
          {projectName}
        </p>
        <p
          className="text-heading-8 m-0 max-w-full text-balance opacity-60 min-[520px]:whitespace-nowrap"
          data-node-id={captionDescriptionNodeId}
        >
          {description}
        </p>
      </Motion.div>
    </div>
  );
}

export {
  REVEAL_DELAY_SECONDS,
  REVEAL_DURATION_SECONDS,
  REVEAL_HEIGHT_COLLAPSED,
  REVEAL_HEIGHT_EXPANDED,
};
export default HomeHeroTitle;
