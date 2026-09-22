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

test("contact card uses the shader when WebGPU is available", () => {
  assert.match(cardSource, /navigator\.gpu/);
  assert.match(cardSource, /requestAdapter\(\)/);
  assert.match(cardSource, /gradientRenderer === "shader"/);
  assert.match(cardSource, /<ShaderFill/);
  assert.match(cardSource, /paused=\{reduceMotion\}/);
});

test("contact card has a same-palette fallback when WebGPU is unavailable", () => {
  assert.match(cardSource, /setGradientRenderer\("fallback"\)/);
  assert.match(cardSource, /contact-tilt-card__gradient-fallback/);
  assert.match(
    cardStyles,
    /rgb\(255 68 49\)[\s\S]*rgb\(255 255 255\)[\s\S]*rgb\(42 41 41\)/,
  );
  assert.match(
    cardStyles,
    /\.contact-tilt-card__gradient-fallback\s*\{[\s\S]*opacity:\s*0\.2/,
  );
});
