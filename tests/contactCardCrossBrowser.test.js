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
  assert.match(cardSource, /max-\[767px\]:max-w-\[343px\]/);
  assert.match(cardSource, /max-\[767px\]:justify-self-center/);
  assert.match(cardSource, /data-node-id="5074:25773"/);
  assert.match(cardSource, /data-node-id="5074:25774"/);
  assert.match(
    cardStyles,
    /--contact-card-logo-width:\s*74\.0740741%/,
  );
  assert.match(
    cardStyles,
    /\.contact-tilt-card__logo\s*\{[^}]*aspect-ratio:\s*320\s*\/\s*152\.779/,
  );
  assert.match(
    cardStyles,
    /\.contact-tilt-card__logo\s*\{[^}]*width:\s*var\(--contact-card-logo-width\)/,
  );
  assert.match(
    cardStyles,
    /\.contact-tilt-card__logo\s*\{[^}]*transform:\s*translate\(-50%,\s*-50%\)/,
  );
  assert.match(
    cardSource,
    /contact-tilt-card__logo[^\"]*absolute/,
  );
  assert.doesNotMatch(
    cardSource,
    /contact-tilt-card__logo[^"]*h-full[^"]*w-full/,
  );
  assert.doesNotMatch(
    cardStyles,
    /\.contact-tilt-card__logo\s*\{[^}]*inset:/,
  );
  assert.doesNotMatch(cardSource, /gsap|rotationX|rotationY/);
  assert.doesNotMatch(cardSource, /pointerdown|pointermove|pointerup|pointercancel/);
  assert.doesNotMatch(cardSource, /will-change-transform/);
  assert.doesNotMatch(cardStyles, /perspective|preserve-3d/);
  assert.doesNotMatch(cardSource, /contact-tilt-card__glare/);
  assert.doesNotMatch(cardStyles, /contact-tilt-card__glare|__surface::after/);
});

test("contact card keeps the shader on compatible iPhone Safari and falls back on Android touch", () => {
  assert.match(cardSource, /useState\("fallback"\)/);
  assert.match(cardSource, /navigator\.gpu/);
  assert.match(cardSource, /requestAdapter\(\)/);
  assert.match(
    cardSource,
    /\(hover: none\) and \(pointer: coarse\)/,
  );
  assert.match(cardSource, /isAndroidTouchDevice/);
  assert.match(cardSource, /\/android\/i/);
  assert.match(cardSource, /prefersCssGradient = isAndroidTouchDevice\(\)/);
  assert.match(cardSource, /gradientRenderer === "shader"/);
  assert.match(cardSource, /<ShaderFill/);
  assert.match(cardSource, /paused=\{reduceMotion\}/);
});

test("contact card has an animated same-palette CSS fallback for Android and unsupported GPU devices", () => {
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
