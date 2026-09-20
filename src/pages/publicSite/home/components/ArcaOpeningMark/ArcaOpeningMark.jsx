import { motion as Motion, useReducedMotion } from "motion/react";

import maskAsset from "../../../../../assets/home/arca-loader-mask.svg";
import vectorAsset from "../../../../../assets/home/arca-loader-vector.svg";

const MOTION_DURATION_SECONDS = 3.679666;
const VECTOR_OFFSET_Y = -248.974;
const MASK_WIDTH = 159.334;
const HIGHLIGHT_OFFSET_X = -MASK_WIDTH;
const HIGHLIGHT_WIDTH = MASK_WIDTH;
const HIGHLIGHTS = [
  { id: "4569:111858", top: 154.255, arrival: 0.4326 },
  { id: "4569:111866", top: 126.606, arrival: 0.4543 },
  { id: "4569:111874", top: 98.973, arrival: 0.4725 },
  { id: "4569:111882", top: 71.332, arrival: 0.4924 },
  { id: "4569:111890", top: 43.69, arrival: 0.5114 },
];

const vectorEase = (progress) =>
  1 -
  Math.exp(-progress * 11.1803) *
    (Math.cos(progress * 0.1581) +
      70.7054 * Math.sin(progress * 0.1581));

function ArcaOpeningMark({ className = "", repeat = Infinity }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={`relative h-[177.8px] w-[187.5px] shrink-0 overflow-hidden ${className}`}
      role="img"
      aria-label="ARCA Studio"
      data-node-id="4569:111846"
    >
      <div className="relative h-[237.071px] w-[250px] origin-top-left scale-75">
      <Motion.div
        className="absolute left-0 top-[248.974px] h-[237.071px] w-[250px] will-change-transform"
        data-node-id="4569:111850"
        initial={reduceMotion ? false : { y: 0 }}
        animate={{
          y: reduceMotion
            ? VECTOR_OFFSET_Y
            : [0, 0, VECTOR_OFFSET_Y, VECTOR_OFFSET_Y],
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                y: {
                  duration: MOTION_DURATION_SECONDS,
                  times: [0, 0.0595, 0.44, 1],
                  ease: ["linear", vectorEase, "linear"],
                  repeat,
                },
              }
        }
        aria-hidden="true"
      >
        <img
          src={vectorAsset}
          alt=""
          className="block h-full w-full max-w-none"
        />
      </Motion.div>

      {HIGHLIGHTS.map((highlight) => (
        <div
          key={highlight.id}
          className="absolute left-[81.9px] h-[74.467px] w-[159.33px]"
          style={{
            top: `${highlight.top}px`,
            maskImage: `url("${maskAsset}")`,
            WebkitMaskImage: `url("${maskAsset}")`,
            maskPosition: "0 0",
            WebkitMaskPosition: "0 0",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskSize: "159.33px 74.467px",
            WebkitMaskSize: "159.33px 74.467px",
          }}
          aria-hidden="true"
        >
          <Motion.div
            className="absolute left-[159.33px] top-0 h-[74.467px] bg-[var(--color-neutral-100-uniform)] will-change-transform"
            data-node-id={highlight.id}
            initial={
              reduceMotion
                ? false
                : { width: HIGHLIGHT_WIDTH, x: 0, y: 0 }
            }
            animate={{
              x: reduceMotion
                ? HIGHLIGHT_OFFSET_X
                : [0, 0, HIGHLIGHT_OFFSET_X, HIGHLIGHT_OFFSET_X],
            }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    x: {
                      duration: MOTION_DURATION_SECONDS,
                      times: [0, 0.275, highlight.arrival, 1],
                      ease: ["linear", "easeInOut", "linear"],
                      repeat,
                    },
                  }
            }
            style={{ width: HIGHLIGHT_WIDTH }}
          />
        </div>
      ))}
      </div>
    </div>
  );
}

export { MOTION_DURATION_SECONDS };
export default ArcaOpeningMark;
