import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "motion/react";

import HomeScrollHint from "../HomeScrollHint/HomeScrollHint.jsx";
import { connectStatementPlayback } from "../../utils/statementVideoPlayback.js";
import {
  drawStatementCanvasMask,
  getStatementCanvasPixelRatio,
} from "../../utils/statementCanvasMask.js";

const STATEMENT_FOCUS_LETTER = "c";

function HomeStatementPanel({
  active = false,
  effectStarted = false,
  mediaEnabled = false,
  mp4Source,
  phrase,
  poster,
  progress,
  statementVisible = false,
  webmSource,
}) {
  const reduceMotion = useReducedMotion();
  const videoPlaying = !reduceMotion;
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const renderMaskRef = useRef(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const focusLetterIndex = phrase
    .toLocaleLowerCase("es")
    .indexOf(STATEMENT_FOCUS_LETTER);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let context = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!context) return undefined;

    let cancelled = false;
    let resizeFrame = 0;

    const renderMask = () => {
      if (cancelled) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (!width || !height) return;

      const pixelRatio = getStatementCanvasPixelRatio(
        window.devicePixelRatio,
      );
      const pixelWidth = Math.max(1, Math.round(width * pixelRatio));
      const pixelHeight = Math.max(1, Math.round(height * pixelRatio));

      if (
        canvas.width !== pixelWidth ||
        canvas.height !== pixelHeight
      ) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        context = canvas.getContext("2d", {
          alpha: true,
          desynchronized: true,
        });

        if (!context) return;
      }

      const styles = window.getComputedStyle(canvas);
      const overlayColor =
        styles
          .getPropertyValue("--color-neutral-950-uniform")
          .trim() || "#111111";
      const fontFamily = styles.fontFamily || "sans-serif";
      const fontWeight = styles.fontWeight || "700";

      context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0,
      );

      drawStatementCanvasMask({
        context,
        focusLetterIndex,
        fontFamily,
        fontWeight,
        height,
        overlayColor,
        phrase,
        progress: progress.get(),
        width,
      });
    };

    const scheduleRender = () => {
      if (resizeFrame || cancelled) return;

      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        renderMask();
      });
    };

    renderMaskRef.current = renderMask;
    renderMask();

    const unsubscribeProgress = progress.on("change", renderMask);
    const resizeObserver = new ResizeObserver(scheduleRender);
    resizeObserver.observe(canvas);

    const visualViewport = window.visualViewport;
    visualViewport?.addEventListener("resize", scheduleRender, {
      passive: true,
    });

    document.fonts?.ready
      .then(() => {
        if (!cancelled) scheduleRender();
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      if (renderMaskRef.current === renderMask) {
        renderMaskRef.current = null;
      }
      if (resizeFrame) {
        window.cancelAnimationFrame(resizeFrame);
      }
      unsubscribeProgress();
      resizeObserver.disconnect();
      visualViewport?.removeEventListener("resize", scheduleRender);
    };
  }, [focusLetterIndex, phrase, progress]);

  useLayoutEffect(() => {
    if (!effectStarted) return;
    renderMaskRef.current?.();
  }, [effectStarted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    return connectStatementPlayback(video, {
      active,
      enabled: mediaEnabled,
      playing: videoPlaying,
    });
  }, [active, mediaEnabled, videoPlaying]);

  return (
    <section
      className="relative h-dvh w-full shrink-0 overflow-hidden bg-[var(--color-neutral-950-uniform)]"
      aria-hidden={!active}
      data-home-panel
      data-home-statement-panel
      data-navbar-background="dark"
    >
      <img
        src={poster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        aria-hidden="true"
      />

      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover object-center ${
          videoFailed ? "hidden" : "block"
        }`}
        autoPlay={mediaEnabled && videoPlaying}
        muted
        loop
        playsInline
        poster={poster}
        preload={mediaEnabled ? "auto" : "none"}
        onError={() => setVideoFailed(true)}
        aria-hidden="true"
      >
        <source src={mp4Source} type="video/mp4" />
        <source src={webmSource} type="video/webm" />
      </video>

      <div
        className="pointer-events-none absolute inset-0 bg-[var(--color-neutral-950-uniform)] opacity-20 mix-blend-multiply"
        aria-hidden="true"
      />

      <canvas
        ref={canvasRef}
        className={`pointer-events-none absolute inset-0 h-full w-full font-[var(--font-sans)] font-bold ${
          effectStarted ? "visible" : "invisible"
        }`}
        aria-hidden="true"
        data-home-statement-mask-canvas
      />

      <h2 className="sr-only" aria-hidden={!statementVisible}>
        {phrase}
      </h2>

      {statementVisible && <HomeScrollHint variant="edge" />}
    </section>
  );
}

export default HomeStatementPanel;
