import { useEffect, useState } from "react";
import { createBackgroundSampler, getBackgroundAppearance } from "./headerContrast.js";

export default function useHeaderBackground(headerRef, scrollContainerRef) {
  const [appearance, setAppearance] = useState("dark");

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return undefined;
    const sample = createBackgroundSampler(document, header);
    let frame;
    let lastSample = -Infinity;

    const update = (time) => {
      // También detecta video, revelados y cambios de tema sin depender de scrollTop.
      if (!document.hidden && time - lastSample >= 160) {
        lastSample = time;
        const bounds = header.getBoundingClientRect();
        const container = scrollContainerRef?.current?.getBoundingClientRect();
        const y = Math.max(0, container?.top ?? 0) + header.offsetHeight / 2;
        if (bounds.bottom > 0 && y < window.innerHeight) {
          const samples = [0.2, 0.35, 0.5, 0.65, 0.8]
            .map((ratio) => sample(bounds.left + bounds.width * ratio, y))
            .filter(Boolean);
          setAppearance((previous) => getBackgroundAppearance(samples, previous));
        }
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [headerRef, scrollContainerRef]);

  return appearance;
}
