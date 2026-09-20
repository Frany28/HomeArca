import assert from "node:assert/strict";
import test from "node:test";
import { getBackgroundAppearance, getCoverPoint, luminance } from "../src/pages/publicSite/components/PublicSiteHeader/headerContrast.js";

test("elige texto claro sobre superficies oscuras y oscuro sobre claras", () => {
  assert.equal(getBackgroundAppearance([[15, 15, 15]], "light"), "dark");
  assert.equal(getBackgroundAppearance([[255, 255, 255]], "dark"), "light");
  assert.equal(getBackgroundAppearance([[220, 215, 200]], "dark"), "light");
  assert.equal(getBackgroundAppearance([[25, 35, 60]], "light"), "dark");
});

test("el umbral usa luminancia y conserva la variante en fondos ambiguos", () => {
  assert.ok(luminance([0, 255, 0]) > luminance([255, 0, 0]));
  assert.equal(getBackgroundAppearance([[130, 130, 130]], "dark"), "dark");
  assert.equal(getBackgroundAppearance([[130, 130, 130]], "light"), "light");
  assert.equal(getBackgroundAppearance([], "light"), "light");
});

test("muestrea el recorte visible object-cover en escritorio y móvil", () => {
  const desktop = { left: 0, top: 0, width: 1440, height: 900 };
  const mobile = { left: 0, top: 0, width: 375, height: 812 };
  assert.deepEqual(getCoverPoint(desktop, 1920, 1080, 720, 450), { x: 960, y: 540 });
  assert.deepEqual(getCoverPoint(mobile, 1920, 1080, 187.5, 406), { x: 960, y: 540 });
  const cropped = getCoverPoint(mobile, 1920, 1080, 0, 0);
  assert.ok(cropped.x > 700);
  assert.equal(cropped.y, 0);
});
