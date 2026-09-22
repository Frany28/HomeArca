import { getHomeStatementVisualState } from "./homeScrollNavigation.js";

const STATEMENT_FONT_MIN_PX = 24;
const STATEMENT_FONT_MAX_PX = 46;
const STATEMENT_FONT_VIEWPORT_RATIO = 0.032;
const STATEMENT_LETTER_SPACING_PX = -1;
const STATEMENT_BASELINE_EM_OFFSET = 0.35;
const STATEMENT_MAX_DEVICE_PIXEL_RATIO = 2;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getStatementCanvasFontSize(width) {
  const safeWidth = Number.isFinite(width) ? width : 0;

  return clamp(
    safeWidth * STATEMENT_FONT_VIEWPORT_RATIO,
    STATEMENT_FONT_MIN_PX,
    STATEMENT_FONT_MAX_PX,
  );
}

function getStatementCanvasPixelRatio(devicePixelRatio = 1) {
  if (!Number.isFinite(devicePixelRatio) || devicePixelRatio <= 0) return 1;

  return Math.min(devicePixelRatio, STATEMENT_MAX_DEVICE_PIXEL_RATIO);
}

function getTextMetricsBounds(metrics) {
  const fallbackWidth = Number.isFinite(metrics?.width) ? metrics.width : 0;
  const left = Number.isFinite(metrics?.actualBoundingBoxLeft)
    ? metrics.actualBoundingBoxLeft
    : 0;
  const right = Number.isFinite(metrics?.actualBoundingBoxRight)
    ? metrics.actualBoundingBoxRight
    : fallbackWidth;
  const ascent = Number.isFinite(metrics?.actualBoundingBoxAscent)
    ? metrics.actualBoundingBoxAscent
    : 0;
  const descent = Number.isFinite(metrics?.actualBoundingBoxDescent)
    ? metrics.actualBoundingBoxDescent
    : 0;

  return {
    left,
    right,
    ascent,
    descent,
  };
}

function measureStatementGlyphRun(
  context,
  phrase,
  letterSpacing = STATEMENT_LETTER_SPACING_PX,
) {
  const glyphs = Array.from(phrase ?? "");
  const measuredGlyphs = glyphs.map((glyph) => ({
    glyph,
    metrics: context.measureText(glyph),
  }));

  const totalAdvance = measuredGlyphs.reduce(
    (sum, { metrics }, index) =>
      sum +
      (Number.isFinite(metrics.width) ? metrics.width : 0) +
      (index < measuredGlyphs.length - 1 ? letterSpacing : 0),
    0,
  );

  return {
    glyphs: measuredGlyphs,
    totalAdvance,
  };
}

function getStatementCanvasLayout({
  context,
  focusLetterIndex,
  height,
  phrase,
  progress,
  width,
  letterSpacing = STATEMENT_LETTER_SPACING_PX,
}) {
  const fontSize = getStatementCanvasFontSize(width);
  const baselineY = height / 2 + fontSize * STATEMENT_BASELINE_EM_OFFSET;
  const { glyphs, totalAdvance } = measureStatementGlyphRun(
    context,
    phrase,
    letterSpacing,
  );
  const firstX = width / 2 - totalAdvance / 2;

  let cursorX = firstX;
  let focusAnchorX = width / 2;
  let focusAnchorY = height / 2;

  glyphs.forEach(({ metrics }, index) => {
    const glyphWidth = Number.isFinite(metrics.width) ? metrics.width : 0;

    if (index === focusLetterIndex) {
      const bounds = getTextMetricsBounds(metrics);
      focusAnchorX = cursorX + (bounds.right - bounds.left) / 2;
      focusAnchorY = baselineY + (bounds.descent - bounds.ascent) / 2;
    }

    cursorX += glyphWidth + letterSpacing;
  });

  const { maskScale } = getHomeStatementVisualState(progress);

  return {
    baselineY,
    firstX,
    focusAnchorX,
    focusAnchorY,
    fontSize,
    glyphs,
    letterSpacing,
    maskScale,
  };
}

function drawStatementCanvasMask({
  context,
  focusLetterIndex,
  height,
  overlayColor,
  phrase,
  progress,
  width,
  fontFamily,
  fontWeight = "700",
  letterSpacing = STATEMENT_LETTER_SPACING_PX,
}) {
  if (!context || width <= 0 || height <= 0) return null;

  const fontSize = getStatementCanvasFontSize(width);

  context.save();
  context.clearRect(0, 0, width, height);
  context.fillStyle = overlayColor;
  context.fillRect(0, 0, width, height);
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  context.textAlign = "left";
  context.textBaseline = "alphabetic";

  const layout = getStatementCanvasLayout({
    context,
    focusLetterIndex,
    height,
    phrase,
    progress,
    width,
    letterSpacing,
  });

  context.globalCompositeOperation = "destination-out";
  context.translate(layout.focusAnchorX, layout.focusAnchorY);
  context.scale(layout.maskScale, layout.maskScale);
  context.translate(-layout.focusAnchorX, -layout.focusAnchorY);

  let cursorX = layout.firstX;

  layout.glyphs.forEach(({ glyph, metrics }, index) => {
    context.fillText(glyph, cursorX, layout.baselineY);
    cursorX +=
      (Number.isFinite(metrics.width) ? metrics.width : 0) +
      (index < layout.glyphs.length - 1 ? letterSpacing : 0);
  });

  context.restore();

  return layout;
}

export {
  STATEMENT_LETTER_SPACING_PX,
  drawStatementCanvasMask,
  getStatementCanvasFontSize,
  getStatementCanvasLayout,
  getStatementCanvasPixelRatio,
  measureStatementGlyphRun,
};
