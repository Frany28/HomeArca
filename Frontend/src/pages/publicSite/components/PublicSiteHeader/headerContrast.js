/** Calcula la luminancia relativa sRGB del fondo visible. */
export function luminance([red, green, blue]) {
  const linear = [red, green, blue].map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

/** Selecciona la variante con mayor contraste y evita oscilar en el umbral. */
export function getBackgroundAppearance(samples, previous = "dark") {
  if (!samples.length) return previous;
  const background = samples.reduce((sum, color) => sum + luminance(color), 0) / samples.length;
  const lightContrast = 1.05 / (background + 0.05);
  const darkContrast = (background + 0.05) / (luminance([42, 41, 41]) + 0.05);
  const advantage = lightContrast / darkContrast;
  if (previous === "dark" && advantage >= 0.9) return "dark";
  if (previous === "light" && advantage <= 1.1) return "light";
  return lightContrast > darkContrast ? "dark" : "light";
}

/** Convierte coordenadas del viewport al recorte object-cover centrado del medio. */
export function getCoverPoint(bounds, width, height, x, y) {
  const scale = Math.max(bounds.width / width, bounds.height / height);
  return {
    x: Math.max(0, Math.min(width - 1, (x - bounds.left + (width * scale - bounds.width) / 2) / scale)),
    y: Math.max(0, Math.min(height - 1, (y - bounds.top + (height * scale - bounds.height) / 2) / scale)),
  };
}

/** Muestrea las capas bajo el header sin descargar ni persistir recursos adicionales. */
export function createBackgroundSampler(document, header) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const blockedSources = new WeakMap();
  if (!context) return () => null;

  return (x, y) => {
    const layers = document.elementsFromPoint(x, y)
      .filter((element) => !header.contains(element) && !element.contains(header));
    context.clearRect(0, 0, 1, 1);
    for (const element of layers.reverse()) {
      const style = document.defaultView.getComputedStyle(element);
      if (style.visibility === "hidden" || Number(style.opacity) === 0) continue;
      context.globalAlpha = Number(style.opacity);
      context.fillStyle = style.backgroundColor;
      context.fillRect(0, 0, 1, 1);

      // Las máscaras de video declaran su superficie: no se puede leer una máscara SVG como píxeles DOM.
      const surface = element.closest("[data-navbar-background]")?.dataset.navbarBackground;
      if (surface) {
        context.fillStyle = surface === "light" ? "white" : "black";
        context.fillRect(0, 0, 1, 1);
        continue;
      }

      if (element.tagName === "IMG" || element.tagName === "VIDEO") {
        const width = element.naturalWidth || element.videoWidth;
        const height = element.naturalHeight || element.videoHeight;
        const source = element.currentSrc || element.src;
        if (blockedSources.get(element) === source) return null;
        if (!width || !height) continue;
        const bounds = element.getBoundingClientRect();
        const point = getCoverPoint(bounds, width, height, x, y);
        try {
          context.drawImage(element, point.x, point.y, 1, 1, 0, 0, 1, 1);
          context.getImageData(0, 0, 1, 1);
        } catch {
          // CORS o medio aún no disponible: conservar la variante anterior y no repetir el fallo.
          blockedSources.set(element, source);
          canvas.width = 1;
          return null;
        }
      }

      // El degradado de los paneles declara la opacidad de sus tres paradas negras.
      if (element.dataset.navbarScrim) {
        const stops = element.dataset.navbarScrim.split(",").map(Number);
        const bounds = element.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (y - bounds.top) / bounds.height));
        const segment = progress < 0.5 ? 0 : 1;
        const alpha = stops[segment] + (stops[segment + 1] - stops[segment]) * (progress * 2 - segment);
        context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        context.fillRect(0, 0, 1, 1);
      }
    }
    const pixel = context.getImageData(0, 0, 1, 1).data;
    return pixel[3] === 255 ? Array.from(pixel).slice(0, 3) : null;
  };
}
