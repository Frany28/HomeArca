import { useRef } from "react";
import { motion as Motion, useInView, useReducedMotion } from "motion/react";
import { getSectionRevealClip, getSectionRevealTransition } from "../utils/sectionReveal.js";

export default function SectionTitleReveal({
  children,
  enabled = true,
  visible: requestedVisible,
  onRevealComplete,
  ...props
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.2 });
  const reduceMotion = useReducedMotion();
  // Los paneles animados pueden solicitar el revelado antes de cruzar el umbral del
  // observador. El resto de las secciones conserva la entrada real al viewport.
  const visible = enabled && (
    Boolean(reduceMotion) || (requestedVisible ?? inView)
  );

  return (
    <div {...props} ref={ref}>
      {/* El observador necesita una superficie que la máscara no recorte. */}
      <Motion.div
        className="flex w-full flex-col items-center gap-[inherit]"
        initial={false}
        animate={{ clipPath: getSectionRevealClip(visible) }}
        transition={getSectionRevealTransition(visible, reduceMotion)}
        onAnimationComplete={() => { if (visible) onRevealComplete?.(); }}
      >
        {children}
      </Motion.div>
    </div>
  );
}
