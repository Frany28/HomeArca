import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const projectImageSource = readFileSync(
  new URL(
    "../src/components/ui/ProjectImage/ProjectImage.jsx",
    import.meta.url,
  ),
  "utf8",
);
const mediaLoaderSource = readFileSync(
  new URL(
    "../src/components/ui/MediaLoader/MediaLoader.jsx",
    import.meta.url,
  ),
  "utf8",
);

test("ProjectImage uses only its lightweight media loader", () => {
  assert.match(projectImageSource, /MediaLoader\/MediaLoader\.jsx/);
  assert.match(projectImageSource, /<MediaLoader/);
  assert.doesNotMatch(projectImageSource, /Loader\/Loader\.jsx|preset="media"/);
});

test("MediaLoader preserves the existing media skeleton and status markup", () => {
  assert.match(mediaLoaderSource, /role="status"/);
  assert.match(mediaLoaderSource, /aria-live="polite"/);
  assert.match(mediaLoaderSource, /aria-busy="true"/);
  assert.match(
    mediaLoaderSource,
    /skeleton-shimmer block size-full rounded-\[inherit\]/,
  );
  assert.match(mediaLoaderSource, /data-skeleton-tone="surface"/);
  assert.match(mediaLoaderSource, /<span className="sr-only">\{label\}<\/span>/);
});

test("the general Loader remains available for other presentations", () => {
  assert.equal(
    existsSync(
      new URL(
        "../src/components/ui/Loader/Loader.jsx",
        import.meta.url,
      ),
    ),
    true,
  );
});
