import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "motion/react";

import HomeScrollHint from "../HomeScrollHint/HomeScrollHint.jsx";
import { connectStatementPlayback } from "../../utils/statementVideoPlayback.js";
import { getHomeStatementTransform } from "../../utils/homeScrollNavigation.js";
import { classifyViewportResize } from "../../utils/viewportResize.js";
import {
  createStatementGeometryRefreshQueue,
  isStatementGeometrySettled,
  shouldDeferStatementGeometryResize,
} from "../../utils/statementGeometry.js";

const STATEMENT_MASK_ID = "home-statement-video-mask";
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
  const svgRef = useRef(null);
  const maskGroupRef = useRef(null);
  const maskTextRef = useRef(null);
  const focusGlyphRef = useRef(null);
  const geometryRef = useRef({
    ready: false,
    anchorX: 0,
    anchorY: 0,
  });
  const effectStartedRef = useRef(effectStarted);
  const statementVisibleRef = useRef(statementVisible);
  const [videoFailed, setVideoFailed] = useState(false);

  effectStartedRef.current = effectStarted;
  statementVisibleRef.current = statementVisible;

  const focusLetterIndex = phrase
    .toLocaleLowerCase("es")
    .indexOf(STATEMENT_FOCUS_LETTER);

  const renderMaskTransform = useCallback((value) => {
    const maskGroup = maskGroupRef.current;
    const geometry = geometryRef.current;

    if (!maskGroup || !geometry.ready) return;

    const { scale, translateX, translateY } = getHomeStatementTransform(
      value,
      geometry.anchorX,
      geometry.anchorY,
    );

    maskGroup.setAttribute(
      "transform",
      `matrix(${scale} 0 0 ${scale} ${translateX} ${translateY})`,
    );
  }, []);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const maskGroup = maskGroupRef.current;
    const maskText = maskTextRef.current;
    const focusGlyph = focusGlyphRef.current;

    if (!svg || !maskGroup || !maskText) return undefined;

    let cancelled = false;
    let animationHasProgressed = false;
    let previousViewportSize = {
      width: svg.clientWidth,
      height: svg.clientHeight,
    };

    const geometryIsSettled = () =>
      isStatementGeometrySettled({
        animationHasProgressed,
        effectStarted: effectStartedRef.current,
        progress: progress.get(),
        statementVisible: statementVisibleRef.current,
      });

    let measureGeometry;
    const geometryRefreshQueue = createStatementGeometryRefreshQueue({
      cancelFrame: (frameId) => window.cancelAnimationFrame(frameId),
      clearTimer: (timerId) => window.clearTimeout(timerId),
      measure: () => measureGeometry({ force: true }),
      requestFrame: (callback) => window.requestAnimationFrame(callback),
      setTimer: (callback, delay) => window.setTimeout(callback, delay),
    });

    measureGeometry = ({ force = false } = {}) => {
      if (cancelled) return;

      const width = svg.clientWidth;
      const height = svg.clientHeight;

      if (!width || !height) return;

      const resizeKind = classifyViewportResize({
        previousWidth: previousViewportSize.width,
        previousHeight: previousViewportSize.height,
        nextWidth: width,
        nextHeight: height,
        hasVisualViewport: Boolean(window.visualViewport),
        coarsePointer:
          window.matchMedia?.("(pointer: coarse)").matches ?? false,
      });

      previousViewportSize = { width, height };

      if (!force && shouldDeferStatementGeometryResize(resizeKind)) {
        geometryRefreshQueue.defer(geometryIsSettled);
        renderMaskTransform(progress.get());
        return;
      }

      maskGroup.removeAttribute("transform");
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

      const focusBounds = (focusGlyph ?? maskText).getBBox();
      if (!focusBounds.width || !focusBounds.height) return;

      geometryRef.current = {
        ready: true,
        anchorX: focusBounds.x + focusBounds.width / 2,
        anchorY: focusBounds.y + focusBounds.height / 2,
      };
      geometryRefreshQueue.complete();

      renderMaskTransform(progress.get());
    };

    measureGeometry({ force: true });
    document.fonts?.ready
      .then(() => {
        geometryRefreshQueue.markPending();
        geometryRefreshQueue.flushIfSettled(geometryIsSettled);
      })
      .catch(() => undefined);

    const handleProgress = (value) => {
      if (value > 0 && value < 1) animationHasProgressed = true;
      renderMaskTransform(value);
      geometryRefreshQueue.flushIfSettled(geometryIsSettled);
    };
    const unsubscribeProgress = progress.on("change", handleProgress);
    const resizeObserver = new ResizeObserver(() => measureGeometry());
    resizeObserver.observe(svg);

    return () => {
      cancelled = true;
      geometryRefreshQueue.destroy();
      unsubscribeProgress();
      resizeObserver.disconnect();
    };
  }, [phrase, progress, renderMaskTransform]);

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

      <svg
        ref={svgRef}
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        className={`pointer-events-none absolute inset-0 h-full w-full ${
          effectStarted ? "visible" : "invisible"
        }`}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <mask
            id={STATEMENT_MASK_ID}
            x="0"
            y="0"
            width="100%"
            height="100%"
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
            className="[mask-type:luminance]"
          >
            <rect width="100%" height="100%" fill="white" />
            <g ref={maskGroupRef}>
              <text
                ref={maskTextRef}
                x="50%"
                y="50%"
                dy="0.35em"
                textAnchor="middle"
                fill="black"
                className="font-[var(--font-sans)] text-[clamp(24px,3.2vw,46px)] font-bold tracking-[-1px]"
              >
                {focusLetterIndex < 0 ? (
                  phrase
                ) : (
                  <>
                    {phrase.slice(0, focusLetterIndex)}
                    <tspan ref={focusGlyphRef}>{phrase[focusLetterIndex]}</tspan>
                    {phrase.slice(focusLetterIndex + 1)}
                  </>
                )}
              </text>
            </g>
          </mask>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="var(--color-neutral-950-uniform)"
          mask={`url(#${STATEMENT_MASK_ID})`}
        />
      </svg>

      <h2 className="sr-only" aria-hidden={!statementVisible}>
        {phrase}
      </h2>

      {statementVisible && <HomeScrollHint variant="edge" />}
    </section>
  );
}

export default HomeStatementPanel;
