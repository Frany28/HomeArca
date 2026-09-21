import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { HOME_SCROLL_PHASES } from "../src/pages/publicSite/home/utils/homeScrollNavigation.js";

const openingHomeSource = readFileSync(
  new URL("../src/pages/publicSite/home/OpeningHome.jsx", import.meta.url),
  "utf8",
);
const contactSectionSource = readFileSync(
  new URL(
    "../src/pages/publicSite/contact/components/ContactSection.jsx",
    import.meta.url,
  ),
  "utf8",
);
const contactTiltCardSource = readFileSync(
  new URL(
    "../src/pages/publicSite/contact/components/ContactTiltCard.jsx",
    import.meta.url,
  ),
  "utf8",
);
const contactTiltCardStyles = readFileSync(
  new URL(
    "../src/pages/publicSite/contact/components/ContactTiltCard.css",
    import.meta.url,
  ),
  "utf8",
);
const contactShaderRuntimeSource = readFileSync(
  new URL(
    "../src/pages/publicSite/contact/components/lib/custom-effect-runtime/index.jsx",
    import.meta.url,
  ),
  "utf8",
);
const movingGradientShaderSource = readFileSync(
  new URL(
    "../src/pages/publicSite/contact/components/lib/custom-effects/CodeComponentId_8ce92017e53431a2f04b3574f4ba7c98f6f55f1e_625.js",
    import.meta.url,
  ),
  "utf8",
);
const footerSource = readFileSync(
  new URL(
    "../src/components/ui/FooterSection/FooterSection.jsx",
    import.meta.url,
  ),
  "utf8",
);

test("Contact is the final Home section and participates in shared navigation", () => {
  const aboutPosition = openingHomeSource.indexOf("<AboutSection");
  const contactPosition = openingHomeSource.indexOf("<ContactSection");

  assert.ok(aboutPosition >= 0);
  assert.ok(contactPosition > aboutPosition);
  assert.match(contactSectionSource, /<section\s+[\s\S]*?id="contact"/);
  assert.match(openingHomeSource, /"#contact"/);
  assert.match(openingHomeSource, /onContact=\{navigateToContact\}/);
  assert.match(openingHomeSource, /navigateToSection\("contact"\)/);
  assert.match(contactSectionSource, /onNavChange=\{handleFooterNavigation\}/);
});

test("the public CTA Footer presentation is additive and reuses the UI system", () => {
  assert.match(footerSource, /presentation = "default"/);
  assert.match(footerSource, /presentation === "publicCta"/);
  assert.match(footerSource, /presentation !== "publicCta"/);
  assert.match(footerSource, /<PublicCtaFooter/);
  assert.match(footerSource, /<MainLogo/);
  assert.match(footerSource, /<HorizontalTabMenu/);
  assert.match(footerSource, /<Button/);
  assert.match(footerSource, /<Input/);
  assert.match(footerSource, /onSubscribeClick/);
  assert.match(contactSectionSource, /presentation="publicCta"/);
});

test("Contact preserves the Home phases and owns no scroll interception", () => {
  assert.deepEqual(HOME_SCROLL_PHASES, {
    IMAGE: "image",
    TITLE: "title",
    EFFECT: "effect",
  });
  assert.doesNotMatch(contactSectionSource, /ScrollTrigger|data-home-panel|data-about-story/);
  assert.doesNotMatch(contactTiltCardSource, /ScrollTrigger|addEventListener\("wheel"|preventDefault|stopPropagation/);
});

test("the card disables tilt and gradient motion for reduced motion", () => {
  assert.match(contactTiltCardSource, /useReducedMotion/);
  assert.match(contactTiltCardSource, /if \(reduceMotion\) return undefined/);
  assert.match(contactTiltCardSource, /paused=\{reduceMotion\}/);
  assert.match(contactTiltCardStyles, /prefers-reduced-motion: reduce/);
  assert.match(contactShaderRuntimeSource, /frameState\.time = paused \? 0 : time/);
});

test("the color layer uses Figma's Moving gradient shader without scroll input", () => {
  assert.match(contactTiltCardSource, /intensity: 3\.9800000190734863/);
  assert.match(contactTiltCardSource, /morphSpeed: 3\.740000009536743/);
  assert.match(contactTiltCardSource, /rotationSpeed: 12/);
  assert.match(contactTiltCardSource, /zoom: 72/);
  assert.match(contactTiltCardSource, /warp: 0\.25999999046325684/);
  assert.match(contactTiltCardSource, /twist: 0\.03999999910593033/);
  assert.match(movingGradientShaderSource, /fn perlin3/);
  assert.match(movingGradientShaderSource, /fn warpDomainMotion/);
  assert.doesNotMatch(contactTiltCardStyles, /@keyframes contact-gradient-flow/);
  assert.doesNotMatch(
    `${contactShaderRuntimeSource}\n${movingGradientShaderSource}`,
    /addEventListener\(["'](?:wheel|scroll)["']|ScrollTrigger/,
  );
});

test("the exact Figma logo vectors are stored locally", () => {
  for (const asset of ["mark.svg", "registration.svg", "date.svg"]) {
    assert.equal(
      existsSync(
        new URL(
          `../src/assets/logos/secondaryLogoParts/${asset}`,
          import.meta.url,
        ),
      ),
      true,
    );
  }

  assert.doesNotMatch(contactTiltCardSource, /figma\.com\/api\/mcp\/asset/);
});
