import { useCallback, useRef, useState } from "react";

import SectionTitleReveal from "../../components/SectionTitleReveal.jsx";
import { PROCESSES_HEADING, PROCESS_VIDEOS } from "../processesContent.js";
import ProcessesVideoGrid from "./ProcessesVideoGrid.jsx";
import ProcessesVideoModal from "./ProcessesVideoModal.jsx";

function ProcessesSection({ active = false, titleVisible = false }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoOrigin, setVideoOrigin] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const triggerRef = useRef(null);

  const handleVideoOpen = useCallback((video, origin) => {
  triggerRef.current = document.activeElement;
  setSelectedVideo(video);
  setVideoOrigin(origin);
  setViewerOpen(true);
}, []);

  const handleVideoClose = useCallback(() => {
    setViewerOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  return (
    <section
      id="process"
      aria-label="Nuestros procesos"
      className="dark flex min-h-dvh flex-col gap-[var(--spacing-gap-8)] bg-[var(--color-neutral-950-uniform)] pt-[var(--spacing-gap-9)] pb-[var(--spacing-gap-8)] max-[767px]:gap-0 max-[767px]:py-[56px]"
      data-node-id="5156:130860"
      data-content-title-scope="process"
    >
      <SectionTitleReveal
        visible={titleVisible}
        className="mx-auto flex w-full shrink-0 max-w-[1200px] flex-col items-center gap-[24px] px-[16px] py-[var(--spacing-gap-8)] text-center text-[var(--color-neutral-100-uniform)] min-[768px]:px-[var(--spacing-gap-8)]"
        data-node-id="I5156:130860;5082:16778"
      >
        <p className="text-heading-4 m-0 w-full text-center max-[767px]:!text-[20px] max-[767px]:!leading-[24px] max-[767px]:!tracking-[-0.5px] max-[767px]:whitespace-nowrap" data-node-id="I5156:130860;5082:16779">
          {PROCESSES_HEADING.eyebrow}
        </p>
        <h2
          className="text-heading-1 m-0 w-full max-w-[770px] text-center max-[767px]:!text-[24px] max-[767px]:!leading-[30px] max-[767px]:!tracking-[-0.5px]"
          data-node-id="I5156:130860;5082:16780"
        >
          {PROCESSES_HEADING.title}
        </h2>
        <p
          className="text-heading-6 m-0 w-full max-w-[520px] break-words text-center opacity-60 max-[767px]:!text-[18px] max-[767px]:!leading-[22px] max-[767px]:!tracking-[-0.5px]"
          data-node-id="I5156:130860;5082:16781"
        >
          {PROCESSES_HEADING.description}
        </p>
      </SectionTitleReveal>

      <ProcessesVideoGrid
        active={active}
        inert={viewerOpen}
        videos={PROCESS_VIDEOS}
        onVideoOpen={handleVideoOpen}
      />

      <ProcessesVideoModal
        visible={viewerOpen}
        video={selectedVideo}
        origin={videoOrigin}
        onClose={handleVideoClose}
      />
    </section>
  );
}

export default ProcessesSection;
