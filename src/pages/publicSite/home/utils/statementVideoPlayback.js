function connectStatementPlayback(video, { active, enabled, playing, documentTarget = document }) {
  const synchronize = () => {
    if (!active || !enabled || !playing || documentTarget.hidden) return;
    video.defaultMuted = true;
    video.muted = true;
    video.play()?.catch(() => undefined);
  };
  const mediaEvents = ["canplay", "loadeddata", "loadedmetadata"];
  mediaEvents.forEach((eventName) => {
    video.addEventListener(eventName, synchronize);
  });
  documentTarget.addEventListener("visibilitychange", synchronize);
  synchronize();
  return () => {
    mediaEvents.forEach((eventName) => {
      video.removeEventListener(eventName, synchronize);
    });
    documentTarget.removeEventListener("visibilitychange", synchronize);
  };
}

export { connectStatementPlayback };
