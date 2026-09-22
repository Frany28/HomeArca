import { useEffect, useState } from "react";

const REDUCED_MOTION_DURATION_MS = 450;
const MAX_LOADING_DURATION_MS = 15000;

function preloadImage(source) {
  return new Promise((resolve) => {
    const image = new Image();
    const finish = () => resolve();

    image.onload = finish;
    image.onerror = finish;
    image.src = source;

    if (image.complete) finish();
  });
}

function useHomeOpeningSequence({
  imageSources,
  motionDurationSeconds,
  reduceMotion,
}) {
  const [phase, setPhase] = useState("opening");
  const [initialScrollReady, setInitialScrollReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timers = new Set();
    const minimumDuration = reduceMotion
      ? REDUCED_MOTION_DURATION_MS
      : motionDurationSeconds * 1000;
    const wait = (duration) =>
      new Promise((resolve) => {
        const timerId = window.setTimeout(() => {
          timers.delete(timerId);
          resolve();
        }, duration);
        timers.add(timerId);
      });
    const resourcesReady = Promise.allSettled([
      ...imageSources.map(preloadImage),
      document.fonts?.ready ?? Promise.resolve(),
    ]);

    Promise.all([
      Promise.race([resourcesReady, wait(MAX_LOADING_DURATION_MS)]),
      wait(minimumDuration),
    ]).then(() => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
      timers.clear();
      if (cancelled) return;

      if (reduceMotion) {
        setInitialScrollReady(true);
        setPhase("complete");
      } else {
        setPhase("transitioning");
      }
    });

    return () => {
      cancelled = true;
      timers.forEach((timerId) => window.clearTimeout(timerId));
      timers.clear();
    };
  }, [imageSources, motionDurationSeconds, reduceMotion]);

  const completePanelTransition = () => {
    if (phase === "transitioning") setPhase("complete");
  };

  return {
    completeInitialTitleReveal: () => setInitialScrollReady(true),
    completePanelTransition,
    initialScrollReady,
    phase,
  };
}

export default useHomeOpeningSequence;
