import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const cardSource = readFileSync(
  new URL(
    "../src/pages/publicSite/contact/components/ContactTiltCard.jsx",
    import.meta.url,
  ),
  "utf8",
);

const cardStyles = readFileSync(
  new URL(
    "../src/pages/publicSite/contact/components/ContactTiltCard.css",
    import.meta.url,
  ),
  "utf8",
);

test("contact card keeps Figma geometry without percentage-height children", () => {
  assert.match(cardSource, /aspect-\[432\/264\.779\]/);
  assert.match(cardSource, /max-w-\[432px\]/);
  assert.match(
    cardStyles,
    /--contact-card-inset:\s*12\.9629629%/,
  );
  assert.match(
    cardStyles,
    /\.contact-tilt-card__logo\s*\{[\s\S]*inset:\s*var\(--contact-card-inset\)/,
  );
  assert.match(
    cardSource,
    /contact-tilt-card__logo absolute/,
  );
  assert.doesNotMatch(
    cardSource,
    /contact-tilt-card__logo[^"]*h-full[^"]*w-full/,
  );
  assert.doesNotMatch(
    cardStyles,
    /\.contact-tilt-card__surface\s*\{[\s\S]*padding:\s*12\.9629629%/,
  );
});

test("contact card uses the shader only on compatible non-touch environments", () => {
  assert.match(cardSource, /useState\("fallback"\)/);
  assert.match(cardSource, /navigator\.gpu/);
  assert.match(cardSource, /requestAdapter\(\)/);
  assert.match(
    cardSource,
    /\(hover: none\) and \(pointer: coarse\)/,
  );
  assert.match(cardSource, /prefersCssGradient/);
  assert.match(cardSource, /gradientRenderer === "shader"/);
  assert.match(cardSource, /<ShaderFill/);
  assert.match(cardSource, /paused=\{reduceMotion\}/);
});

test("contact card has an animated same-palette CSS fallback for Android and touch devices", () => {
  assert.match(cardSource, /setGradientRenderer\("fallback"\)/);
  assert.match(cardSource, /contact-tilt-card__gradient-fallback/);
  assert.match(
    cardStyles,
    /rgb\(255 68 49[\s\S]*rgb\(255 255 255[\s\S]*rgb\(42 41 41\)/,
  );
  assert.match(
    cardStyles,
    /\.contact-tilt-card__gradient-fallback\s*\{[\s\S]*opacity:\s*0\.2/,
  );
  assert.match(
    cardStyles,
    /animation:\s*contact-card-gradient-drift 7s ease-in-out infinite alternate/,
  );
  assert.match(cardStyles, /@keyframes contact-card-gradient-drift/);
  assert.match(
    cardStyles,
    /prefers-reduced-motion:[\s\S]*contact-tilt-card__gradient-fallback/,
  );
});
