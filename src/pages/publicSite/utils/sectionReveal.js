const REVEAL_DELAY_SECONDS = 0.1;
const REVEAL_DURATION_SECONDS = 0.9;

function getSectionRevealTransition(visible, reduceMotion) {
  return reduceMotion ? { duration: 0 } : {
    type: "spring",
    duration: REVEAL_DURATION_SECONDS,
    bounce: 0.12,
    delay: visible ? REVEAL_DELAY_SECONDS : 0,
  };
}

function getSectionRevealClip(visible) {
  return visible ? "inset(0 0 0 0)" : "inset(0 0 100% 0)";
}

export { getSectionRevealTransition, getSectionRevealClip, REVEAL_DELAY_SECONDS, REVEAL_DURATION_SECONDS };
