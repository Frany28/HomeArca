import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const projectImageSource = readFileSync(
  new URL(
    "../src/components/ui/ProjectImage/ProjectImage.jsx",
    import.meta.url,
  ),
  "utf8",
);
const tabItemSource = readFileSync(
  new URL(
    "../src/components/ui/TabItem/TabItem.jsx",
    import.meta.url,
  ),
  "utf8",
);

test("Iconsax components use explicit imports without changing icon names", () => {
  assert.match(
    projectImageSource,
    /import \{ Image as ImageIcon \} from "iconsax-react";/,
  );
  assert.match(tabItemSource, /import \{ Box2 \} from "iconsax-react";/);
  assert.doesNotMatch(
    `${projectImageSource}\n${tabItemSource}`,
    /import \* as .* from "iconsax-react"/,
  );
  assert.match(projectImageSource, /<ImageIcon size="24"/);
  assert.match(tabItemSource, /<Box2/);
});
