import { useEffect, useRef } from "react";

const MAX_DEVICE_PIXEL_RATIO = 2;

function destroyGpuResources(state) {
  const destroyed = new Set();

  Object.values(state).forEach((resource) => {
    if (
      resource &&
      typeof resource === "object" &&
      typeof resource.destroy === "function" &&
      !destroyed.has(resource)
    ) {
      resource.destroy();
      destroyed.add(resource);
    }
  });
}

function toCssColor({ r = 0, g = 0, b = 0, a = 1 } = {}) {
  const red = Math.round(Math.min(Math.max(r, 0), 1) * 255);
  const green = Math.round(Math.min(Math.max(g, 0), 1) * 255);
  const blue = Math.round(Math.min(Math.max(b, 0), 1) * 255);
  const alpha = Math.min(Math.max(a, 0), 1);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function startCanvasFallback(canvas, shader, paused, isDisposed) {
  const context = canvas.getContext("2d");
  if (!context) return () => {};

  const stops = shader?.params?.gradient?.stops ?? [];
  const safeStops = stops.length > 0
    ? stops
    : [
        { position: 0, color: { r: 1, g: 0.9137254902, b: 0.6196078431, a: 1 } },
        { position: 0.5, color: { r: 0.5058823529, g: 0.4705882353, b: 1, a: 1 } },
        { position: 1, color: { r: 1, g: 0, b: 0.6078431373, a: 1 } },
      ];
  const morphSpeed = Math.max(shader?.params?.morphSpeed ?? 3.74, 0);
  const rotationSpeed = Math.max(shader?.params?.rotationSpeed ?? 12, 0);

  let animationFrame = 0;
  let resizeObserver;

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      MAX_DEVICE_PIXEL_RATIO,
    );
    const width = Math.max(1, Math.round(bounds.width * pixelRatio));
    const height = Math.max(1, Math.round(bounds.height * pixelRatio));

    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
  };

  const renderFrame = (time = 0) => {
    if (isDisposed()) return;

    resize();

    const width = canvas.width;
    const height = canvas.height;
    const effectiveTime = paused ? 0 : time * 0.001;
    const angle =
      effectiveTime * (0.14 + rotationSpeed * 0.006) +
      Math.sin(effectiveTime * (0.16 + morphSpeed * 0.035)) * 0.42;

    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const radius = Math.hypot(width, height) * 0.65;
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius;

    context.clearRect(0, 0, width, height);

    const gradient = context.createLinearGradient(
      centerX - dx,
      centerY - dy,
      centerX + dx,
      centerY + dy,
    );

    safeStops.forEach((stop) => {
      const basePosition = Number.isFinite(stop?.position)
        ? stop.position
        : 0;
      const drift = paused
        ? 0
        : Math.sin(
            effectiveTime * (0.22 + morphSpeed * 0.055) +
              basePosition * Math.PI * 2,
          ) * 0.055;
      const position = Math.min(Math.max(basePosition + drift, 0), 1);

      gradient.addColorStop(position, toCssColor(stop?.color));
    });

    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    if (!paused) {
      animationFrame = window.requestAnimationFrame(renderFrame);
    }
  };

  resizeObserver = new ResizeObserver(() => {
    if (paused && !isDisposed()) renderFrame(0);
  });
  resizeObserver.observe(canvas);
  renderFrame(0);

  return () => {
    window.cancelAnimationFrame(animationFrame);
    resizeObserver?.disconnect();
  };
}

export function ShaderFill({ shader, paused = false, ...canvasProps }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return undefined;

    let animationFrame = 0;
    let disposed = false;
    let frameState;
    let resizeObserver;
    let stopFallback = null;

    const useFallback = () => {
      if (disposed || stopFallback) return;
      stopFallback = startCanvasFallback(
        canvas,
        shader,
        paused,
        () => disposed,
      );
    };

    const start = async () => {
      if (!navigator.gpu) {
        useFallback();
        return;
      }

      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter || disposed) {
          if (!disposed) useFallback();
          return;
        }

        const device = await adapter.requestDevice();
        if (disposed) {
          device.destroy();
          return;
        }

        const context = canvas.getContext("webgpu");
        if (!context) {
          device.destroy();
          useFallback();
          return;
        }

        const format = navigator.gpu.getPreferredCanvasFormat();
        frameState = {
          state: {},
          params: shader.params,
          output: null,
          input: null,
          mousePosition: null,
          time: 0,
        };

        shader.setup(device, frameState);

        const resize = () => {
          const bounds = canvas.getBoundingClientRect();
          const pixelRatio = Math.min(
            window.devicePixelRatio || 1,
            MAX_DEVICE_PIXEL_RATIO,
          );
          const width = Math.max(1, Math.round(bounds.width * pixelRatio));
          const height = Math.max(1, Math.round(bounds.height * pixelRatio));

          if (canvas.width === width && canvas.height === height) return;

          canvas.width = width;
          canvas.height = height;
          context.configure({
            device,
            format,
            alphaMode: "premultiplied",
          });
        };

        const renderFrame = (time) => {
          if (disposed) return;

          resize();
          frameState.time = paused ? 0 : time;
          frameState.output = context.getCurrentTexture();
          shader.render(device, frameState);

          if (!paused) animationFrame = requestAnimationFrame(renderFrame);
        };

        resizeObserver = new ResizeObserver(() => {
          if (paused && !disposed) renderFrame(0);
        });
        resizeObserver.observe(canvas);
        renderFrame(0);
      } catch {
        useFallback();
      }
    };

    start();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      stopFallback?.();

      if (frameState) destroyGpuResources(frameState.state);
    };
  }, [paused, shader]);

  return <canvas ref={canvasRef} {...canvasProps} />;
}
