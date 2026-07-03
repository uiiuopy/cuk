import React, { useEffect, useRef, useState } from "react";

interface InteractiveGridProps {
  clickInteraction?: boolean;
  clickForce?: number;
  motionSpeed?: number;
  cursorTrail?: boolean;
  trailMode?: "hover" | "click";
  trailLength?: number;
  trailColor?: string;
  backgroundColor?: string;
  gridColor?: string;
  dotColor?: string;
  hoverColor?: string;
  gridSize?: number;
  repulsionStrength?: number;
  radius?: number;
  dotSize?: number;
  gridThickness?: number;
  baseOpacity?: number;
  style?: React.CSSProperties;
}

interface GridDot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  targetSize: number;
  brightness: number;
}

interface ParsedColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

function mapLinear(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (inMax === inMin) return outMin;
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

function mapSpeedUiToInternal(ui: number): number {
  const clamped = Math.max(0.1, Math.min(1, ui));
  return mapLinear(clamped, 0.1, 1, 0.1, 2);
}

function mapEaseUiToInternal(ui: number): number {
  const clamped = Math.max(0, Math.min(1, ui));
  return mapLinear(clamped, 0, 1, 0.01, 0.2);
}

export default function InteractiveGrid({
  clickInteraction = true,
  clickForce = 0.5,
  motionSpeed = 0.8,
  cursorTrail = true,
  trailMode = "hover",
  trailLength = 0.1,
  trailColor = "#0f2d59",
  backgroundColor = "transparent",
  gridColor = "rgba(15, 45, 89, 0.05)",
  dotColor = "rgba(15, 45, 89, 0.08)",
  hoverColor = "#0f2d59",
  gridSize = 60,
  repulsionStrength = -0.3,
  radius = 220,
  dotSize = 1.0,
  gridThickness = 0.4,
  baseOpacity = 0.06,
  style = {}
}: InteractiveGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const dotsRef = useRef<Map<string, GridDot>>(new Map());
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const trailPointsRef = useRef<TrailPoint[]>([]);
  const isMouseDownRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  const colorsRef = useRef({
    backgroundColor,
    gridColor,
    dotColor,
    hoverColor,
    gridSize,
    repulsionStrength,
    radius,
    dotSize,
    gridThickness,
    baseOpacity,
    clickInteraction,
    clickForce,
    motionSpeed,
    cursorTrail,
    trailMode,
    trailLength,
    trailColor
  });

  const prevGridSizeRef = useRef(gridSize);

  useEffect(() => {
    const gridSizeChanged = prevGridSizeRef.current !== gridSize;
    prevGridSizeRef.current = gridSize;
    colorsRef.current = {
      backgroundColor,
      gridColor,
      dotColor,
      hoverColor,
      gridSize,
      repulsionStrength,
      radius,
      dotSize,
      gridThickness,
      baseOpacity,
      clickInteraction,
      clickForce,
      motionSpeed,
      cursorTrail,
      trailMode,
      trailLength,
      trailColor
    };

    if (gridSizeChanged && mounted && canvasRef.current) {
      const canvas = canvasRef.current;
      const width = canvas.clientWidth || canvas.offsetWidth || 1;
      const height = canvas.clientHeight || canvas.offsetHeight || 1;
      dotsRef.current.clear();
      for (let gx = -gridSize; gx < width + gridSize * 2; gx += gridSize) {
        for (let gy = -gridSize; gy < height + gridSize * 2; gy += gridSize) {
          const key = `${gx},${gy}`;
          dotsRef.current.set(key, {
            x: gx,
            y: gy,
            vx: 0,
            vy: 0,
            size: 1,
            targetSize: 1,
            brightness: 1
          });
        }
      }
    }
  }, [
    mounted,
    backgroundColor,
    gridColor,
    dotColor,
    hoverColor,
    gridSize,
    repulsionStrength,
    radius,
    dotSize,
    gridThickness,
    baseOpacity,
    clickInteraction,
    clickForce,
    motionSpeed,
    cursorTrail,
    trailMode,
    trailLength,
    trailColor
  ]);

  const parseColor = (color: string): ParsedColor => {
    if (!color || color === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
    const rgbaMatch = color.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)/i);
    if (rgbaMatch)
      return {
        r: parseInt(rgbaMatch[1]),
        g: parseInt(rgbaMatch[2]),
        b: parseInt(rgbaMatch[3]),
        a: parseFloat(rgbaMatch[4])
      };
    const rgbMatch = color.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgbMatch)
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3]),
        a: 1
      };
    let hex = color.replace("#", "");
    if (hex.length === 8) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
        a: parseInt(hex.substring(6, 8), 16) / 255
      };
    }
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    const r = parseInt(hex.substring(0, 2), 16),
      g = parseInt(hex.substring(2, 4), 16),
      b = parseInt(hex.substring(4, 6), 16);
    return {
      r: isNaN(r) ? 15 : r,
      g: isNaN(g) ? 45 : g,
      b: isNaN(b) ? 89 : b,
      a: 1
    };
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const maxDist = 400;

    const getSpringParams = () => {
      const speed = colorsRef.current.motionSpeed;
      const t = Math.max(0, Math.min(1, speed));
      return { springStiffness: 0.02 + t * 0.06, damping: 0.7 + t * 0.05 };
    };

    const getCanvasSize = () => {
      const width = canvas.clientWidth || canvas.offsetWidth || 1;
      const height = canvas.clientHeight || canvas.offsetHeight || 1;
      return { width, height };
    };

    const initDots = () => {
      dotsRef.current.clear();
      const { width, height } = getCanvasSize();
      const currentGridSize = colorsRef.current.gridSize;
      for (let gx = -currentGridSize; gx < width + currentGridSize * 2; gx += currentGridSize) {
        for (let gy = -currentGridSize; gy < height + currentGridSize * 2; gy += currentGridSize) {
          const key = `${gx},${gy}`;
          dotsRef.current.set(key, {
            x: gx,
            y: gy,
            vx: 0,
            vy: 0,
            size: 1,
            targetSize: 1,
            brightness: 1
          });
        }
      }
    };

    let { width, height } = getCanvasSize();
    canvas.width = width;
    canvas.height = height;
    initDots();
    let lastTime = performance.now();

    const getHoverIntensity = (x: number, y: number) => {
      const mouse = mousePosRef.current;
      if (!mouse) return 0;
      const hoverRadius = colorsRef.current.radius;
      const dx = x - mouse.x,
        dy = y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > hoverRadius) return 0;
      return Math.pow(1 - dist / hoverRadius, 3.5);
    };

    const mapRepulsion = (value: number) => {
      return value <= 0 ? value * 25 : value * 90;
    };

    const getCursorPush = (baseX: number, baseY: number) => {
      const mouse = mousePosRef.current;
      const currentRepulsion = colorsRef.current.repulsionStrength;
      const mappedRepulsion = mapRepulsion(currentRepulsion);
      if (!mouse || mappedRepulsion === 0) return { x: 0, y: 0 };
      const dx = baseX - mouse.x,
        dy = baseY - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) return { x: 0, y: 0 };
      const normalizedDist = Math.min(dist / maxDist, 1);
      const pushAmount = Math.pow(1 - normalizedDist, 2) * mappedRepulsion;
      return { x: (dx / dist) * pushAmount, y: (dy / dist) * pushAmount };
    };

    const getClickPush = (baseX: number, baseY: number) => {
      if (!colorsRef.current.clickInteraction || !isMouseDownRef.current) return { x: 0, y: 0 };
      const mouse = mousePosRef.current;
      const force = colorsRef.current.clickForce;
      if (!mouse || force <= 0) return { x: 0, y: 0 };
      const dx = baseX - mouse.x,
        dy = baseY - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) return { x: 0, y: 0 };
      const normalizedDist = Math.min(dist / maxDist, 1);
      const pushAmount = Math.pow(1 - normalizedDist, 2) * force * 100;
      return { x: (dx / dist) * pushAmount, y: (dy / dist) * pushAmount };
    };

    const animate = () => {
      const now = performance.now();
      const deltaTime = now - lastTime;
      lastTime = now;
      const currentColors = colorsRef.current;
      const hoverColorParsed = parseColor(currentColors.hoverColor);
      const gridColorParsed = parseColor(currentColors.gridColor);
      const dotColorParsed = parseColor(currentColors.dotColor);
      const bgColorParsed = parseColor(currentColors.backgroundColor);
      const currentGridSize = currentColors.gridSize;
      const currentDotSize = currentColors.dotSize;
      const currentGridThickness = currentColors.gridThickness;
      const currentBaseOpacity = currentColors.baseOpacity;

      ctx.clearRect(0, 0, width, height);
      if (bgColorParsed.a > 0) {
        ctx.fillStyle = `rgba(${bgColorParsed.r}, ${bgColorParsed.g}, ${bgColorParsed.b}, ${bgColorParsed.a})`;
        ctx.fillRect(0, 0, width, height);
      }

      dotsRef.current.forEach((dot, key) => {
        const [gxStr, gyStr] = key.split(",");
        const gx = parseInt(gxStr),
          gy = parseInt(gyStr);
        const rightDot = dotsRef.current.get(`${gx + currentGridSize},${gy}`);
        const bottomDot = dotsRef.current.get(`${gx},${gy + currentGridSize}`);
        const hoverIntensity = getHoverIntensity(dot.x, dot.y);

        if (rightDot) {
          const avgHover = (hoverIntensity + getHoverIntensity(rightDot.x, rightDot.y)) / 2;
          const r = Math.round(gridColorParsed.r + (hoverColorParsed.r - gridColorParsed.r) * avgHover);
          const g = Math.round(gridColorParsed.g + (hoverColorParsed.g - gridColorParsed.g) * avgHover);
          const b = Math.round(gridColorParsed.b + (hoverColorParsed.b - gridColorParsed.b) * avgHover);
          const lineOpacity = currentBaseOpacity + (1 - currentBaseOpacity) * avgHover;
          ctx.beginPath();
          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(rightDot.x, rightDot.y);
          ctx.lineWidth = currentGridThickness + avgHover * 2;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineOpacity})`;
          ctx.stroke();
        }

        if (bottomDot) {
          const avgHover = (hoverIntensity + getHoverIntensity(bottomDot.x, bottomDot.y)) / 2;
          const r = Math.round(gridColorParsed.r + (hoverColorParsed.r - gridColorParsed.r) * avgHover);
          const g = Math.round(gridColorParsed.g + (hoverColorParsed.g - gridColorParsed.g) * avgHover);
          const b = Math.round(gridColorParsed.b + (hoverColorParsed.b - gridColorParsed.b) * avgHover);
          const lineOpacity = currentBaseOpacity + (1 - currentBaseOpacity) * avgHover;
          ctx.beginPath();
          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(bottomDot.x, bottomDot.y);
          ctx.lineWidth = currentGridThickness + avgHover * 2;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineOpacity})`;
          ctx.stroke();
        }
      });

      const { springStiffness, damping } = getSpringParams();
      dotsRef.current.forEach((dot, key) => {
        const [gxStr, gyStr] = key.split(",");
        const gx = parseInt(gxStr),
          gy = parseInt(gyStr);
        const targetX = gx + getCursorPush(gx, gy).x + getClickPush(gx, gy).x;
        const targetY = gy + getCursorPush(gx, gy).y + getClickPush(gx, gy).y;
        const forceX = (targetX - dot.x) * springStiffness;
        const forceY = (targetY - dot.y) * springStiffness;
        dot.vx = (dot.vx + forceX) * damping;
        dot.vy = (dot.vy + forceY) * damping;
        dot.x += dot.vx;
        dot.y += dot.vy;

        const hoverIntensity = getHoverIntensity(dot.x, dot.y);
        dot.targetSize = currentDotSize + hoverIntensity * currentDotSize;
        dot.size += (dot.targetSize - dot.size) * 0.15;
        const r = Math.round(dotColorParsed.r + (hoverColorParsed.r - dotColorParsed.r) * hoverIntensity);
        const g = Math.round(dotColorParsed.g + (hoverColorParsed.g - dotColorParsed.g) * hoverIntensity);
        const b = Math.round(dotColorParsed.b + (hoverColorParsed.b - dotColorParsed.b) * hoverIntensity);
        const opacity = currentBaseOpacity + (1 - currentBaseOpacity) * hoverIntensity;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, Math.max(currentDotSize * 0.5, dot.size), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fill();
      });

      const { cursorTrail: ct, trailLength: tlen, trailColor: tcolor } = currentColors;
      const effectiveTrailLength = Math.max(1, Math.round(tlen * 50));
      if (ct && effectiveTrailLength > 0) {
        const trail = trailPointsRef.current;
        if (trail.length > 1) {
          const now = performance.now();
          const maxAge = Math.max(200, effectiveTrailLength * 40);
          ctx.save();
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          let started = false;
          for (let i = 0; i < trail.length; i++) {
            const point = trail[i],
              age = now - point.time;
            if (age < maxAge) {
              if (!started) {
                ctx.moveTo(point.x, point.y);
                started = true;
              } else {
                ctx.lineTo(point.x, point.y);
              }
            }
          }
          const trailAlpha =
            trail.length > 0 ? Math.max(0, 1 - (now - trail[trail.length - 1].time) / maxAge) : 0;
          const tc = parseColor(tcolor);
          ctx.strokeStyle = `rgba(${tc.r}, ${tc.g}, ${tc.b}, ${trailAlpha * 0.45 * tc.a})`;
          ctx.stroke();
          ctx.restore();
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const canvasWidth = canvas.clientWidth || canvas.offsetWidth || 1;
      const canvasHeight = canvas.clientHeight || canvas.offsetHeight || 1;
      const scaleX = canvasWidth / rect.width;
      const scaleY = canvasHeight / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      if (x >= 0 && y >= 0 && x <= canvasWidth && y <= canvasHeight) {
        mousePosRef.current = { x, y };
        const { cursorTrail: ct, trailMode: tm, trailLength: tlen } = colorsRef.current;
        const effectiveLength = Math.max(1, Math.round(tlen * 100));
        if (ct && effectiveLength > 0 && (tm === "hover" || isMouseDownRef.current)) {
          const now = performance.now();
          const trail = trailPointsRef.current;
          trail.push({ x, y, time: now });
          if (trail.length > effectiveLength) trail.splice(0, trail.length - effectiveLength);
        }
      } else {
        mousePosRef.current = null;
      }
    };

    const handleMouseDown = () => {
      isMouseDownRef.current = true;
    };

    const handleMouseUp = () => {
      if (colorsRef.current.trailMode === "click") trailPointsRef.current = [];
      isMouseDownRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const canvasWidth = canvas.clientWidth || canvas.offsetWidth || 1;
      const canvasHeight = canvas.clientHeight || canvas.offsetHeight || 1;
      const scaleX = canvasWidth / rect.width;
      const scaleY = canvasHeight / rect.height;
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;

      if (x >= 0 && y >= 0 && x <= canvasWidth && y <= canvasHeight) {
        mousePosRef.current = { x, y };
        const { cursorTrail: ct, trailMode: tm, trailLength: tlen } = colorsRef.current;
        const effectiveLength = Math.max(1, Math.round(tlen * 100));
        if (ct && effectiveLength > 0 && (tm === "hover" || isMouseDownRef.current)) {
          const now = performance.now();
          const trail = trailPointsRef.current;
          trail.push({ x, y, time: now });
          if (trail.length > effectiveLength) trail.splice(0, trail.length - effectiveLength);
        }
      } else {
        mousePosRef.current = null;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      isMouseDownRef.current = true;
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const canvasWidth = canvas.clientWidth || canvas.offsetWidth || 1;
        const canvasHeight = canvas.clientHeight || canvas.offsetHeight || 1;
        const scaleX = canvasWidth / rect.width;
        const scaleY = canvasHeight / rect.height;
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;
        if (x >= 0 && y >= 0 && x <= canvasWidth && y <= canvasHeight) {
          mousePosRef.current = { x, y };
        }
      }
    };

    const handleTouchEnd = () => {
      if (colorsRef.current.trailMode === "click") trailPointsRef.current = [];
      isMouseDownRef.current = false;
      mousePosRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    const handleResize = () => {
      const newSize = getCanvasSize();
      width = newSize.width;
      height = newSize.height;
      canvas.width = width;
      canvas.height = height;
      initDots();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      resizeObserver.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        ...style
      }}
    />
  );
}
