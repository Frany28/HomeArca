import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const TRANSITION_MS = 320;
const TRANSITION_EASING = "ease-in-out";

function ProcessesVideoModal({ onClose, origin, video, visible }) {
  const videoRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  const [shouldRender, setShouldRender] = useState(visible);
  const [targetRect, setTargetRect] = useState(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      return undefined;
    }

    return undefined;
  }, [visible]);

  useLayoutEffect(() => {
    if (!shouldRender || !video || !origin) return undefined;

    const calculateTarget = () => {
      const element = videoRef.current;
      if (!element) return;

      const videoWidth = element.videoWidth || 9;
      const videoHeight = element.videoHeight || 16;
      const ratio = videoWidth / videoHeight;

      const maxWidth = window.innerWidth - 32;
      const maxHeight = window.innerHeight - 32;

      let width = maxWidth;
      let height = width / ratio;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * ratio;
      }

      setTargetRect({
        width,
        height,
        left: (window.innerWidth - width) / 2,
        top: (window.innerHeight - height) / 2,
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setActive(true);
        });
      });
    };

    const element = videoRef.current;

    if (element?.readyState >= 1) {
      calculateTarget();
    } else {
      element?.addEventListener("loadedmetadata", calculateTarget, {
        once: true,
      });
    }

    return () => {
      element?.removeEventListener("loadedmetadata", calculateTarget);
    };
  }, [origin, shouldRender, video]);

  useEffect(() => {
    if (!shouldRender) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [shouldRender]);

  useEffect(
    () => () => {
      window.clearTimeout(closeTimeoutRef.current);
    },
    [],
  );

  const handleClose = () => {
    if (!active) return;

    setActive(false);

    closeTimeoutRef.current = window.setTimeout(() => {
      setShouldRender(false);
      onClose?.();
    }, TRANSITION_MS);
  };

  if (!shouldRender || !video || !origin) {
    return null;
  }

  const currentRect =
    active && targetRect
      ? targetRect
      : origin;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] overflow-hidden"
      onClick={handleClose}
    >
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${
          active ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transitionDuration: `${TRANSITION_MS}ms`,
          transitionTimingFunction: TRANSITION_EASING,
        }}
      />

      <div
      className="fixed overflow-hidden rounded-[var(--radius-3)]"
      onClick={(event) => event.stopPropagation()}
      style={{
        top: currentRect.top,
        left: currentRect.left,
        width: currentRect.width,
        height: currentRect.height,
        transitionProperty: "top, left, width, height",
        transitionDuration: `${TRANSITION_MS}ms`,
        transitionTimingFunction: TRANSITION_EASING,
      }}
    >
        <video
          ref={videoRef}
          key={video.id}
          className="size-full cursor-pointer object-cover"
          poster={video.poster}
          autoPlay
          loop
          muted
          playsInline
          aria-label={video.description}
          onClick={handleClose}
        >
          <source src={video.webm} type="video/webm" />
        </video>
      </div>
    </div>,
    document.body,
  );
}

export default ProcessesVideoModal;
