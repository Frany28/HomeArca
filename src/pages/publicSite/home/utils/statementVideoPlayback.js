function connectStatementPlayback(
  video,
  {
    active,
    enabled,
    playing,
    documentTarget = document,
    interactionTarget = documentTarget,
  },
) {
  const synchronize = () => {
    if (!active || !enabled || !playing || documentTarget.hidden) return;
    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute?.("playsinline", "");
    video.setAttribute?.("webkit-playsinline", "");
    video.play()?.catch(() => undefined);
  };

  const mediaEvents = ["canplay", "loadeddata", "loadedmetadata"];
  const interactionEvents = ["touchstart", "pointerdown"];

  mediaEvents.forEach((eventName) => {
    video.addEventListener(eventName, synchronize);
  });
  interactionEvents.forEach((eventName) => {
    interactionTarget.addEventListener(eventName, synchronize, { passive: true });
  });
  documentTarget.addEventListener("visibilitychange", synchronize);

  synchronize();

  return () => {
    mediaEvents.forEach((eventName) => {
      video.removeEventListener(eventName, synchronize);
    });
    interactionEvents.forEach((eventName) => {
      interactionTarget.removeEventListener(eventName, synchronize);
    });
    documentTarget.removeEventListener("visibilitychange", synchronize);
  };
}

export { connectStatementPlayback };
