import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  motion as Motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

const FINAL_DESKTOP_WIDTH = 1104;
const FINAL_DESKTOP_HEIGHT = 736;


const IMAGE_ASPECT_RATIO = 4096 / 2731;

const ABOUT_CREDIT_LINES = [
  "En ARCA Studio entendemos que",
  "cada proyecto representa una",
  "inversión importante y una decisión",
  "que impactará durante años. Por eso",
  "combinamos diseño, planificación y",
  "ejecución para desarrollar espacios",
  "funcionales, duraderos y",
  "cuidadosamente pensados para",
  "quienes los habitan.",
];

const CREDITS_START_PROGRESS = 0.20;
const CREDITS_END_PROGRESS = 0.80;

const FRAME_SHRINK_START_PROGRESS = 0.84;
const FRAME_SHRINK_END_PROGRESS = 0.99;

function CreditLine({
  line,
  index,
  creditsTrackY,
  stageHeight,
  mobile = false,
}) {
  const lineHeight = mobile ? 38 : 58;
  const gap = 24;
  const paddingTop = 48;

  const lineOffset =
    paddingTop +
    index * (lineHeight + gap);

  const lineViewportY = useTransform(
    () =>
      creditsTrackY.get() +
      lineOffset,
  );

  const opacity = useTransform(
    lineViewportY,
    [
      stageHeight * 0.84,
      stageHeight * 1.03,
    ],
    [
      1,
      0,
    ],
  );

  const blur = useTransform(
    lineViewportY,
    [
      stageHeight * 0.84,
      stageHeight * 1.03,
    ],
    [
      "blur(0px)",
      "blur(6px)",
    ],
  );

  const y = useTransform(
    lineViewportY,
    [
      stageHeight * 0.84,
      stageHeight * 1.03,
    ],
    [
      0,
      18,
    ],
  );

  return (
    <Motion.p
      className="
        m-0
        w-full
        shrink-0
        text-center
        font-[var(--font-sans)]
        text-[48px]
        font-bold
        leading-[58px]
        tracking-[-1px]
        text-[var(--color-neutral-100-uniform)]

        max-[767px]:text-[30px]
        max-[767px]:leading-[38px]
      "
      style={{
        opacity,
        filter: blur,
        y,
      }}
    >
      {line}
    </Motion.p>
  );
}
function AboutStory({
  image,
  progress,
}) {
  const reduceMotion =
    useReducedMotion();

  const visualProgress = useSpring(
    progress,
    {
      stiffness: 65,
      damping: 20,
      mass: 0.65,
      restDelta: 0.001,
    },
  );

  const stageRef =
    useRef(null);

  const creditsRef =
    useRef(null);

  const [creditsHeight, setCreditsHeight] =
    useState(0);

  const [stageSize, setStageSize] =
    useState(() => ({
      width:
        typeof window !== "undefined"
          ? window.innerWidth
          : 1440,

      height:
        typeof window !== "undefined"
          ? window.innerHeight
          : 960,
    }));

  useLayoutEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return undefined;
    }

    const updateStageSize = () => {
      const rect =
        stage.getBoundingClientRect();

      setStageSize({
        width: rect.width,
        height: rect.height,
      });
    };

    updateStageSize();

    const observer =
      new ResizeObserver(
        updateStageSize,
      );

    observer.observe(stage);

    return () => {
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const credits = creditsRef.current;

    if (!credits) {
      return undefined;
    }

    const updateCreditsHeight = () => {
      setCreditsHeight(
        credits.getBoundingClientRect()
          .height,
      );
    };

    updateCreditsHeight();

    const observer =
      new ResizeObserver(
        updateCreditsHeight,
      );

    observer.observe(credits);

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * =====================================================
   * TAMAÑO INICIAL
   * =====================================================
   *
   * La imagen ocupa toda la altura disponible,
   * pero mantiene su proporción 3:2.
   *
   * De esta manera NO queda estirada a todo el ancho.
   */
  const initialWidth = Math.max(
  stageSize.width,
  stageSize.height * IMAGE_ASPECT_RATIO,
  );

  const initialHeight =
  initialWidth / IMAGE_ASPECT_RATIO;

  /*
   * =====================================================
   * TAMAÑO FINAL
   * =====================================================
   *
   * Figma:
   * 1104 × 736
   */

  const finalWidth =
    stageSize.width >=
    FINAL_DESKTOP_WIDTH + 32
      ? FINAL_DESKTOP_WIDTH
      : Math.max(
          stageSize.width - 32,
          0,
        );

  const finalHeight =
    finalWidth *
    (
      FINAL_DESKTOP_HEIGHT /
      FINAL_DESKTOP_WIDTH
    );

  /*
   * =====================================================
   * TRANSFORMACIÓN DEL FRAME
   * =====================================================
   *
   * Hasta 0.76:
   * mantiene tamaño inicial.
   *
   * 0.76 → 0.94:
   * se reduce.
   *
   * 0.94 → 1:
   * tamaño final.
   */

 const frameWidth = useTransform(
  visualProgress,
  [
    0,
    FRAME_SHRINK_START_PROGRESS,
    FRAME_SHRINK_END_PROGRESS,
    1,
  ],
  [
    initialWidth,
    initialWidth,
    finalWidth,
    finalWidth,
  ],
);

 const frameHeight = useTransform(
  visualProgress,
  [
    0,
    FRAME_SHRINK_START_PROGRESS,
    FRAME_SHRINK_END_PROGRESS,
    1,
  ],
  [
    initialHeight,
    initialHeight,
    finalHeight,
    finalHeight,
  ],
);

 const imageRadius = useTransform(
  visualProgress,
  [
    0,
    FRAME_SHRINK_START_PROGRESS,
    FRAME_SHRINK_END_PROGRESS,
    1,
  ],
  [
    "0px",
    "0px",
    "16px",
    "16px",
  ],
);

  /*
   * =====================================================
   * BLUR
   * =====================================================
   */

const imageFilter = useTransform(
  visualProgress,
  [
    0,
    0.04,
    0.10,
    0.20,
    0.76,
    0.80,
    0.88,
    1,
  ],
  [
    "blur(0px) brightness(1)",
    "blur(0px) brightness(1)",
    "blur(1.5px) brightness(0.94)",
    "blur(3.5px) brightness(0.76)",
    "blur(3.5px) brightness(0.76)",
    "blur(3.5px) brightness(0.76)",
    "blur(0px) brightness(1)",
    "blur(0px) brightness(1)",
  ],
);

const imageInnerScale = useTransform(
  visualProgress,
  [
    0,
    0.12,
    0.28,
    0.62,
    0.8,
    1,
  ],
  [
    1,
    1,
    1.015,
    1.015,
    1,
    1,
  ],
);

const darkness = useTransform(
  visualProgress,
  [
    0,
    0.05,
    0.12,
    0.20,
    0.76,
    0.80,
    0.88,
    1,
  ],
  [
    0,
    0,
    0.08,
    0.18,
    0.18,
    0.18,
    0,
    0,
  ],
); 

  /*
   * =====================================================
   * CRÉDITOS
   * =====================================================
   *
   * El track COMPLETO comienza por debajo
   * del viewport.
   *
   * Conforme se hace scroll atraviesa la
   * pantalla y termina fuera por arriba.
   */

  const creditsStartY =
  stageSize.height + 120;

const creditsEndY =
  -(creditsHeight + 64);

  const creditsTrackY = useTransform(
  visualProgress,
  [
    0,
    CREDITS_START_PROGRESS,
    CREDITS_END_PROGRESS,
    1,
  ],
  [
    creditsStartY,
    creditsStartY,
    creditsEndY,
    creditsEndY,
  ],
);

 

  return (
    <div
      ref={stageRef}
      data-about-story
      className="
        relative
        flex
        h-dvh
        w-full
        items-center
        justify-center
        overflow-hidden
        bg-[var(--color-neutral-950-uniform)]
      "
    >
      {/*
       * FRAME REAL DE LA IMAGEN.
       *
       * ESTE era el elemento que faltaba
       * actualmente en el repositorio.
       */}
      <Motion.div
      className="
        relative
        flex
        shrink-0
        items-center
        justify-center
        overflow-hidden
        will-change-[width,height,border-radius]
      "
      style={{
        width: reduceMotion
          ? finalWidth
          : frameWidth,

        height: reduceMotion
          ? finalHeight
          : frameHeight,

        borderRadius: reduceMotion
          ? "16px"
          : imageRadius,
      }}
    >
        {/*
         * FOTO
         */}
        <Motion.img
          src={image}
          alt=""
          aria-hidden="true"
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            object-center
            will-change-transform
          "
          style={{
            filter: imageFilter,
            scale: imageInnerScale,
          }}
        />

        {/*
         * CAPA OSCURA
         */}
        <Motion.div
          aria-hidden="true"
          className="
            absolute
            inset-0
            z-[1]
            bg-black
          "
          style={{
            opacity: darkness,
          }}
        />

        {/*
         * CRÉDITOS
         */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-10
            overflow-hidden
          "
          style={{
            maskImage:
            "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",

            WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
          }}
        >
        <Motion.div
          ref={creditsRef}
          className="
            absolute
            left-1/2
            top-0
            flex
            w-[min(900px,calc(100%-32px))]
            -translate-x-1/2
            flex-col
            items-center
            gap-[24px]
            py-[48px]
            will-change-transform
          "
          style={{
            y: creditsTrackY,
          }}
        >
            {ABOUT_CREDIT_LINES.map(
            (line, index) => (
              <CreditLine
              key={`${index}-${line}`}
              line={line}
              index={index}
              creditsTrackY={creditsTrackY}
              stageHeight={stageSize.height}
              mobile={stageSize.width <= 767}
            />
            ),
          )}
          </Motion.div>
        </div>
      </Motion.div>
    </div>
  );
}

export default AboutStory;