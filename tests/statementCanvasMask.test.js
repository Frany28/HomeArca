import assert from "node:assert/strict";
import test from "node:test";

import {
  STATEMENT_FOCUS_FILL_X_RATIO,
  drawStatementCanvasMask,
  getStatementCanvasFontSize,
  getStatementCanvasLayout,
  getStatementCanvasPixelRatio,
} from "../src/pages/publicSite/home/utils/statementCanvasMask.js";

function createContext() {
  const calls = [];
  const context = {
    fillStyle: "",
    font: "",
    globalCompositeOperation: "source-over",
    textAlign: "",
    textBaseline: "",
    save() {
      calls.push(["save"]);
    },
    restore() {
      calls.push(["restore"]);
    },
    clearRect(...args) {
      calls.push(["clearRect", ...args]);
    },
    fillRect(...args) {
      calls.push(["fillRect", ...args]);
    },
    translate(...args) {
      calls.push(["translate", ...args]);
    },
    scale(...args) {
      calls.push(["scale", ...args]);
    },
    fillText(...args) {
      calls.push(["fillText", ...args]);
    },
    measureText(glyph) {
      const width = glyph === " " ? 5 : 10;
      return {
        width,
        actualBoundingBoxLeft: 0,
        actualBoundingBoxRight: width,
        actualBoundingBoxAscent: 8,
        actualBoundingBoxDescent: 2,
      };
    },
  };

  return { calls, context };
}

test("statement canvas font size keeps the existing responsive clamp", () => {
  assert.equal(getStatementCanvasFontSize(390), 24);
  assert.equal(getStatementCanvasFontSize(1000), 32);
  assert.equal(getStatementCanvasFontSize(2000), 46);
});

test("statement canvas caps device-pixel density for mobile performance", () => {
  assert.equal(getStatementCanvasPixelRatio(1), 1);
  assert.equal(getStatementCanvasPixelRatio(2), 2);
  assert.equal(getStatementCanvasPixelRatio(3), 2);
  assert.equal(getStatementCanvasPixelRatio(0), 1);
});

test("statement canvas preserves the same zoom endpoints", () => {
  const { context } = createContext();

  const initial = getStatementCanvasLayout({
    context,
    focusLetterIndex: 1,
    height: 800,
    phrase: "abc",
    progress: 0,
    width: 390,
  });
  const final = getStatementCanvasLayout({
    context,
    focusLetterIndex: 1,
    height: 800,
    phrase: "abc",
    progress: 1,
    width: 390,
  });

  assert.equal(initial.maskScale, 180);
  assert.equal(final.maskScale, 1);
  assert.equal(initial.focusAnchorX, final.focusAnchorX);
  assert.equal(initial.focusAnchorY, final.focusAnchorY);
});

test("statement zoom anchor sits inside the solid left arc of the focus C", () => {
  const { context } = createContext();
  const layout = getStatementCanvasLayout({
    context,
    focusLetterIndex: 1,
    height: 800,
    phrase: "abc",
    progress: 0,
    width: 390,
  });

  const glyphAdvance = 10;
  const firstGlyphAdvanceWithTracking = glyphAdvance - 1;
  const focusGlyphLeft = layout.firstX + firstGlyphAdvanceWithTracking;
  const geometricCenter = focusGlyphLeft + glyphAdvance / 2;
  const expectedFillAnchor =
    focusGlyphLeft + glyphAdvance * STATEMENT_FOCUS_FILL_X_RATIO;

  assert.equal(layout.focusAnchorX, expectedFillAnchor);
  assert.ok(layout.focusAnchorX < geometricCenter);
  assert.equal(layout.focusAnchorY, 400);
});

test("statement canvas punches the phrase out of the dark overlay", () => {
  const { calls, context } = createContext();

  const layout = drawStatementCanvasMask({
    context,
    focusLetterIndex: 1,
    fontFamily: "Arial",
    fontWeight: "700",
    height: 800,
    overlayColor: "#111111",
    phrase: "abc",
    progress: 0.5,
    width: 390,
  });

  assert.ok(layout);
  assert.equal(context.globalCompositeOperation, "destination-out");
  assert.ok(calls.some(([name]) => name === "fillRect"));
  assert.equal(
    calls.filter(([name]) => name === "fillText").length,
    3,
  );
  assert.ok(
    calls.some(
      ([name, scaleX, scaleY]) =>
        name === "scale" && scaleX > 1 && scaleY > 1,
    ),
  );
});
