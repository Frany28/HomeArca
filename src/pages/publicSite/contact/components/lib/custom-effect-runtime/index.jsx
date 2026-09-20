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

export function ShaderFill({ shader, paused = false, ...canvasProps }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !navigator.gpu) return undefined;

    let animationFrame = 0;
    let disposed = false;
    let frameState;
    let resizeObserver;

    const start = async () => {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter || disposed) return;

      const device = await adapter.requestDevice();
      if (disposed) {
        device.destroy();
        return;
      }

      const context = canvas.getContext("webgpu");
      if (!context) {
        device.destroy();
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
    };

    start();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();

      if (frameState) destroyGpuResources(frameState.state);
    };
  }, [paused, shader]);

  return <canvas ref={canvasRef} {...canvasProps} />;
}
