import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const buttonSource = readFileSync(
  new URL("../src/components/ui/Button/Button.jsx", import.meta.url),
  "utf8",
);
const footerSource = readFileSync(
  new URL("../src/components/ui/FooterSection/PublicCtaFooter.jsx", import.meta.url),
  "utf8",
);
const contactContentSource = readFileSync(
  new URL("../src/pages/publicSite/contact/contactContent.js", import.meta.url),
  "utf8",
);
const contactSectionSource = readFileSync(
  new URL(
    "../src/pages/publicSite/contact/components/ContactSection.jsx",
    import.meta.url,
  ),
  "utf8",
);
const headerSource = readFileSync(
  new URL(
    "../src/pages/publicSite/components/PublicSiteHeader/PublicSiteHeader.jsx",
    import.meta.url,
  ),
  "utf8",
);
const mobileMenuSource = readFileSync(
  new URL(
    "../src/pages/publicSite/components/PublicSiteHeader/PublicSiteMobileMenu.jsx",
    import.meta.url,
  ),
  "utf8",
);
const openingHomeSource = readFileSync(
  new URL("../src/pages/publicSite/home/OpeningHome.jsx", import.meta.url),
  "utf8",
);

test("contact and social buttons use direct secure external links", () => {
  assert.match(contactContentSource, /https:\/\/wa\.me\/584246674832/);
  assert.match(contactContentSource, /https:\/\/www\.instagram\.com\/arcastudioarq\//);
  assert.match(
    contactContentSource,
    /https:\/\/www\.facebook\.com\/p\/Arca-Studio-61583132387694\//,
  );
  assert.match(contactContentSource, /https:\/\/www\.tiktok\.com\/@arcastudioarq/);
  assert.doesNotMatch(contactContentSource, /google\.com\/url|584246674832\./);
  assert.match(contactSectionSource, /href=\{CONTACT_EXTERNAL_LINKS\.whatsapp\}/);
  assert.match(contactSectionSource, /socialItems=\{CONTACT_SOCIAL_ITEMS\}/);
  assert.match(footerSource, /href=\{item\.href\}/);
  assert.match(buttonSource, /tokens\.add\("noopener"\)/);
  assert.match(buttonSource, /tokens\.add\("noreferrer"\)/);
});

test("desktop and mobile navbar contact buttons use the WhatsApp link", () => {
  assert.match(
    openingHomeSource,
    /contactHref=\{CONTACT_EXTERNAL_LINKS\.whatsapp\}/,
  );
  assert.match(headerSource, /href=\{contactHref\}/);
  assert.match(mobileMenuSource, /href=\{contactHref\}/);
  assert.match(headerSource, /target=\{contactHref \? "_blank" : undefined\}/);
  assert.match(mobileMenuSource, /target=\{contactHref \? "_blank" : undefined\}/);
});
