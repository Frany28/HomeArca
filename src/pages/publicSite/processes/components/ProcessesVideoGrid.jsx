import { useEffect, useState } from "react";

import {
  PROCESS_MOBILE_QUERY,
  getVisibleProcessVideos,
} from "../utils/processVideoVisibility.js";

function getInitialMobileLayout() {
  return typeof window !== "undefined" &&
    window.matchMedia?.(PROCESS_MOBILE_QUERY).matches === true;
}

function useMobileProcessLayout() {
  const [mobileLayout, setMobileLayout] = useState(getInitialMobileLayout);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia(PROCESS_MOBILE_QUERY);
    const handleChange = (event) => setMobileLayout(event.matches);

    setMobileLayout(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener?.(handleChange);
    return () => mediaQuery.removeListener?.(handleChange);
  }, []);

  return mobileLayout;
}

function ProcessesVideoGrid({ active, inert, onVideoOpen, videos }) {
  const mobileLayout = useMobileProcessLayout();
  const visibleVideos = getVisibleProcessVideos(videos, mobileLayout);

  return (
    <div
      className="mx-auto grid w-full max-w-[1152px] grid-cols-2 gap-x-[16px] gap-y-[24px] px-[16px] min-[768px]:gap-[24px] min-[768px]:px-[48px] min-[1024px]:grid-cols-3 min-[1248px]:px-0"
      aria-label="Galería de videos de nuestros procesos"
      inert={inert ? "" : undefined}
      data-node-id="4845:5294"
    >
      {visibleVideos.map((video, index) => (
        <button
          key={video.id}
          type="button"
          className={`group relative aspect-[23/27] min-w-0 touch-manipulation cursor-pointer overflow-hidden rounded-[var(--radius-2)] border-0 bg-[var(--color-neutral-200)] p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-300)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-neutral-950-uniform)] ${index >= 6 ? "max-[767px]:hidden" : ""}`}
          aria-label={`Abrir video: ${video.title}`}
          onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();

            onVideoOpen(video, {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            });
          }}
        >
          {active ? (
            <video
              className="pointer-events-none absolute inset-0 size-full object-cover"
              poster={video.poster}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              tabIndex={-1}
              aria-hidden="true"
            >
              <source src={video.webm} type="video/webm" />
            </video>
          ) : (
            <img
              src={video.poster}
              alt=""
              className="pointer-events-none absolute inset-0 size-full object-cover"
            />
          )}
          <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10 group-focus-visible:bg-black/10 motion-reduce:transition-none" />
        </button>
      ))}
    </div>
  );
}

export default ProcessesVideoGrid;
