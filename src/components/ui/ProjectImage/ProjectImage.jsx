import { useState } from "react";
import * as IconsaxIcons from "iconsax-react";
import clsx from "clsx";

import Loader from "../Loader/Loader.jsx";

const IMAGE_STATUS = { ERROR: "error", LOADED: "loaded", LOADING: "loading" };

/** Shared loading and error state for every project cover and thumbnail. */
function ProjectImage({
  alt = "",
  className,
  fit = "cover",
  imageClassName,
  onStatusChange,
  revealOnLoad = true,
  showLoader = true,
  src,
}) {
  const [imageState, setImageState] = useState({
    src,
    status: src ? IMAGE_STATUS.LOADING : IMAGE_STATUS.ERROR,
  });
  const ImageIcon = IconsaxIcons.Image;
  const status = !src
    ? IMAGE_STATUS.ERROR
    : imageState.src === src
      ? imageState.status
      : IMAGE_STATUS.LOADING;

  return (
    <div
      className={clsx(
        "relative overflow-hidden bg-[var(--color-neutral-10)]",
        className,
      )}
      data-image-status={status}
    >
      {status === IMAGE_STATUS.LOADING && showLoader ? (
        <Loader
          preset="media"
          label={`Cargando ${alt || "imagen"}`}
          className="absolute inset-0 z-[1]"
        />
      ) : null}

      {status === IMAGE_STATUS.ERROR ? (
        <div
          className="absolute inset-0 flex items-center justify-center text-[var(--color-text-100)]"
          aria-hidden="true"
        >
          {ImageIcon ? (
            <ImageIcon size="24" color="currentColor" variant="Linear" />
          ) : null}
        </div>
      ) : null}

      {src ? (
        <img
          src={src}
          alt={alt}
          className={clsx(
            fit === "contain"
              ? "h-auto w-auto max-h-full max-w-full object-contain"
              : "size-full object-cover",
            "transition-opacity duration-200",
            status === IMAGE_STATUS.LOADED || !revealOnLoad
              ? "content-reveal-media opacity-100"
              : "opacity-0",
            imageClassName,
          )}
          onLoad={() => {
            setImageState({ src, status: IMAGE_STATUS.LOADED });
            onStatusChange?.(IMAGE_STATUS.LOADED);
          }}
          onError={() => {
            setImageState({ src, status: IMAGE_STATUS.ERROR });
            onStatusChange?.(IMAGE_STATUS.ERROR);
          }}
        />
      ) : null}
    </div>
  );
}

export default ProjectImage;
