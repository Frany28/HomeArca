import clsx from "clsx";

function MediaLoader({
  className,
  label = "Cargando contenido",
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={clsx(
        "flex w-full flex-col gap-[var(--spacing-gap-4)]",
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="contents">
        <span
          className="skeleton-shimmer block size-full rounded-[inherit]"
          data-skeleton-tone="surface"
          style={{ animationDelay: "0ms" }}
        />
      </div>
    </div>
  );
}

export default MediaLoader;
