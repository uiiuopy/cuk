import React, { useEffect, useRef } from "react";

function mapLinear(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

function mapSpeedUiToInternal(ui) {
  const clamped = Math.max(0.1, Math.min(1, ui));
  return mapLinear(clamped, 0.1, 1, 0.1, 2);
}

function mapEaseUiToInternal(ui) {
  const clamped = Math.max(0, Math.min(1, ui));
  return mapLinear(clamped, 0, 1, 0.01, 0.2);
}

export default function InfiniteCanvas({
  scrollSpeed = 0.4,
  dragSpeed = 0.5,
  ease = 0.3,
  parallax = { enabled: true, general: 1, child: 1 },
  enableDrag = true,
  style = {}
}) {
  const internalScrollSpeed = mapSpeedUiToInternal(scrollSpeed);
  const internalDragSpeed = mapSpeedUiToInternal(dragSpeed);
  const internalEase = mapEaseUiToInternal(ease);

  const containerRef = useRef(null);
  const parentElementRef = useRef(null);
  const elementGroupsRef = useRef([]);
  const isVisible = useRef(false);

  const scroll = useRef({
    ease: internalEase,
    current: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    last: { x: 0, y: 0 },
    delta: { x: { c: 0, t: 0 }, y: { c: 0, t: 0 } }
  });

  const isDragging = useRef(false);
  const drag = useRef({ startX: 0, startY: 0, scrollX: 0, scrollY: 0 });
  const mouse = useRef({
    x: { t: 0.5, c: 0.5 },
    y: { t: 0.5, c: 0.5 },
    press: { t: 0, c: 0 }
  });

  const winW = useRef(typeof window !== "undefined" ? window.innerWidth : 1920);
  const winH = useRef(typeof window !== "undefined" ? window.innerHeight : 1080);
  const parentDimensions = useRef({ width: 0, height: 0, tileSizeW: 0, tileSizeH: 0 });

  const rafId = useRef(null);
  const resizeTimeoutId = useRef(null);

  const initializeInfiniteCanvas = parentElement => {
    if (typeof window !== "undefined") {
      winW.current = window.innerWidth;
      winH.current = window.innerHeight;
    }
    const parentRect = parentElement.getBoundingClientRect();
    const parentWidth = parentRect.width;
    const parentHeight = parentRect.height;

    // Filter out our own wrapper div from the children list
    const baseChildren = Array.from(parentElement.children).filter(
      child => child !== containerRef.current?.parentElement
    );

    const repsX = [0, parentWidth];
    const repsY = [0, parentHeight];
    elementGroupsRef.current = [];

    baseChildren.forEach(baseChild => {
      const rect = baseChild.getBoundingClientRect();
      const baseX = rect.left - parentRect.left;
      const baseY = rect.top - parentRect.top;
      const width = rect.width;
      const height = rect.height;
      const elementEase = Math.random() * 0.5 + 0.5;
      const clones = [];
      const positions = [];

      const originalStyles = {
        position: baseChild.style.position,
        left: baseChild.style.left,
        top: baseChild.style.top,
        width: baseChild.style.width,
        height: baseChild.style.height,
        margin: baseChild.style.margin,
        transform: baseChild.style.transform
      };

      for (let i = 0; i < 3; i++) {
        const clone = baseChild.cloneNode(true);
        parentElement.appendChild(clone);
        clone.style.position = "absolute";
        clone.style.left = "0";
        clone.style.top = "0";
        clone.style.width = `${width}px`;
        clone.style.height = `${height}px`;
        clone.style.margin = "0";
        clone.style.willChange = "transform";
        clones.push(clone);
      }

      baseChild.style.position = "absolute";
      baseChild.style.left = "0";
      baseChild.style.top = "0";
      baseChild.style.width = `${width}px`;
      baseChild.style.height = `${height}px`;
      baseChild.style.margin = "0";
      baseChild.style.willChange = "transform";

      repsX.forEach(offsetX => {
        repsY.forEach(offsetY => {
          positions.push({
            x: baseX + offsetX,
            y: baseY + offsetY,
            width,
            height,
            extraX: 0,
            extraY: 0,
            ease: elementEase,
            baseElement: baseChild
          });
        });
      });

      elementGroupsRef.current.push({
        baseElement: baseChild,
        realElement: baseChild,
        clones,
        positions,
        lastActiveIndex: -1,
        originalStyles
      });
    });

    const tileSizeW = parentWidth * 2;
    const tileSizeH = parentHeight * 2;
    parentDimensions.current = {
      width: parentWidth,
      height: parentHeight,
      tileSizeW,
      tileSizeH
    };
  };

  const cleanupInfiniteCanvas = () => {
    elementGroupsRef.current.forEach(group => {
      group.clones.forEach(clone => {
        if (clone.parentNode) clone.parentNode.removeChild(clone);
      });
      const el = group.realElement;
      el.style.position = group.originalStyles.position;
      el.style.left = group.originalStyles.left;
      el.style.top = group.originalStyles.top;
      el.style.width = group.originalStyles.width;
      el.style.height = group.originalStyles.height;
      el.style.margin = group.originalStyles.margin;
      el.style.transform = group.originalStyles.transform;
      el.style.willChange = "";
      el.style.opacity = "";
      el.style.pointerEvents = "";
      const firstChild = el.firstElementChild;
      if (firstChild) firstChild.style.transform = "";
    });
    elementGroupsRef.current = [];
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let parentElement = container.parentElement;
    if (parentElement) parentElement = parentElement.parentElement;
    if (!parentElement) return;

    parentElementRef.current = parentElement;
    initializeInfiniteCanvas(parentElement);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(parentElement);

    const handleWindowResize = () => {
      if (typeof window !== "undefined") {
        winW.current = window.innerWidth;
        winH.current = window.innerHeight;
      }
    };

    const handleParentResize = () => {
      if (resizeTimeoutId.current !== null) clearTimeout(resizeTimeoutId.current);
      resizeTimeoutId.current = window.setTimeout(() => {
        if (parentElement) {
          cleanupInfiniteCanvas();
          initializeInfiniteCanvas(parentElement);
        }
        resizeTimeoutId.current = null;
      }, 100);
    };

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(handleParentResize);
      resizeObserver.observe(parentElement);
    }

    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
      if (resizeTimeoutId.current !== null) clearTimeout(resizeTimeoutId.current);
      cleanupInfiniteCanvas();
    };
  }, []);

  useEffect(() => {
    const parentElement = parentElementRef.current;
    if (!parentElement) return;
    const handleWheel = e => {
      e.preventDefault();
      scroll.current.target.x -= e.deltaX * internalScrollSpeed;
      scroll.current.target.y -= e.deltaY * internalScrollSpeed;
    };
    parentElement.addEventListener("wheel", handleWheel, { passive: false });
    return () => parentElement.removeEventListener("wheel", handleWheel);
  }, [scrollSpeed, internalScrollSpeed]);

  useEffect(() => {
    const parentElement = parentElementRef.current;
    if (!parentElement || !enableDrag) return;

    const handleMouseDown = e => {
      isDragging.current = true;
      document.documentElement.classList.add("dragging");
      mouse.current.press.t = 1;
      drag.current.startX = e.clientX;
      drag.current.startY = e.clientY;
      drag.current.scrollX = scroll.current.target.x;
      drag.current.scrollY = scroll.current.target.y;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.documentElement.classList.remove("dragging");
      mouse.current.press.t = 0;
    };

    const handleMouseMove = e => {
      mouse.current.x.t = e.clientX / winW.current;
      mouse.current.y.t = e.clientY / winH.current;
      if (isDragging.current) {
        const dx = e.clientX - drag.current.startX;
        const dy = e.clientY - drag.current.startY;
        scroll.current.target.x = drag.current.scrollX + dx * internalDragSpeed;
        scroll.current.target.y = drag.current.scrollY + dy * internalDragSpeed;
      }
    };

    const handleTouchStart = e => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        isDragging.current = true;
        mouse.current.press.t = 1;
        drag.current.startX = touch.clientX;
        drag.current.startY = touch.clientY;
        drag.current.scrollX = scroll.current.target.x;
        drag.current.scrollY = scroll.current.target.y;
      }
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
      mouse.current.press.t = 0;
    };

    const handleTouchMove = e => {
      if (isDragging.current && e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        mouse.current.x.t = touch.clientX / winW.current;
        mouse.current.y.t = touch.clientY / winH.current;
        const dx = touch.clientX - drag.current.startX;
        const dy = touch.clientY - drag.current.startY;
        scroll.current.target.x = drag.current.scrollX + dx * internalDragSpeed;
        scroll.current.target.y = drag.current.scrollY + dy * internalDragSpeed;
      }
    };

    parentElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    parentElement.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      parentElement.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      parentElement.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [enableDrag, dragSpeed, internalDragSpeed]);

  useEffect(() => {
    scroll.current.ease = mapEaseUiToInternal(ease);
  }, [ease]);

  const render = () => {
    if (!isVisible.current) return;
    scroll.current.current.x +=
      (scroll.current.target.x - scroll.current.current.x) * scroll.current.ease;
    scroll.current.current.y +=
      (scroll.current.target.y - scroll.current.current.y) * scroll.current.ease;
    scroll.current.delta.x.t = scroll.current.current.x - scroll.current.last.x;
    scroll.current.delta.y.t = scroll.current.current.y - scroll.current.last.y;
    scroll.current.delta.x.c += (scroll.current.delta.x.t - scroll.current.delta.x.c) * 0.04;
    scroll.current.delta.y.c += (scroll.current.delta.y.t - scroll.current.delta.y.c) * 0.04;
    mouse.current.x.c += (mouse.current.x.t - mouse.current.x.c) * 0.04;
    mouse.current.y.c += (mouse.current.y.t - mouse.current.y.c) * 0.04;
    mouse.current.press.c += (mouse.current.press.t - mouse.current.press.c) * 0.04;

    const dirX = scroll.current.current.x > scroll.current.last.x ? "right" : "left";
    const dirY = scroll.current.current.y > scroll.current.last.y ? "down" : "up";
    const scrollX = scroll.current.current.x;
    const scrollY = scroll.current.current.y;

    const parentW = parentDimensions.current.width;
    const parentH = parentDimensions.current.height;
    const tileW = parentDimensions.current.tileSizeW;
    const tileH = parentDimensions.current.tileSizeH;

    const centerX = winW.current / 2;
    const centerY = winH.current / 2;

    const mousePX = mouse.current.x.t * winW.current;
    const mousePY = mouse.current.y.t * winH.current;

    const parentElement = parentElementRef.current;
    if (!parentElement) return;
    const parentRect = parentElement.getBoundingClientRect();
    const mouseRelX = mousePX - parentRect.left;
    const mouseRelY = mousePY - parentRect.top;

    elementGroupsRef.current.forEach(group => {
      const calculatedPositions = [];
      group.positions.forEach(item => {
        const pM = parallax?.enabled ? parallax.general ?? 1 : 0;
        const pX =
          5 * scroll.current.delta.x.c * item.ease +
          (mouse.current.x.c - 0.5) * item.width * 0.6 * pM;
        const pY =
          5 * scroll.current.delta.y.c * item.ease +
          (mouse.current.y.c - 0.5) * item.height * 0.6 * pM;

        let posX = item.x + scrollX + item.extraX + pX;
        let posY = item.y + scrollY + item.extraY + pY;

        if (dirX === "right" && posX > parentW) item.extraX -= tileW;
        if (dirX === "left" && posX + item.width < 0) item.extraX += tileW;
        if (dirY === "down" && posY > parentH) item.extraY -= tileH;
        if (dirY === "up" && posY + item.height < 0) item.extraY += tileH;

        const fX = item.x + scrollX + item.extraX + pX;
        const fY = item.y + scrollY + item.extraY + pY;
        const absX = fX + parentRect.left;
        const absY = fY + parentRect.top;

        const cx = absX + item.width / 2;
        const cy = absY + item.height / 2;

        calculatedPositions.push({
          item,
          fX,
          fY,
          distC: Math.pow(cx - centerX, 2) + Math.pow(cy - centerY, 2),
          distM: Math.pow(cx - mousePX, 2) + Math.pow(cy - mousePY, 2),
          vis:
            absX >= -item.width - 1000 &&
            absX <= winW.current + 1000 &&
            absY >= -item.height - 1000 &&
            absY <= winH.current + 1000
        });
      });

      let bestIndex = -1;
      let minM = Infinity;
      for (let i = 0; i < calculatedPositions.length; i++) {
        const p = calculatedPositions[i];
        if (
          mouseRelX >= p.fX &&
          mouseRelX <= p.fX + p.item.width &&
          mouseRelY >= p.fY &&
          mouseRelY <= p.fY + p.item.height
        ) {
          if (p.distM < minM) {
            minM = p.distM;
            bestIndex = i;
          }
        }
      }

      if (
        bestIndex === -1 &&
        group.lastActiveIndex !== -1 &&
        calculatedPositions[group.lastActiveIndex]?.vis
      )
        bestIndex = group.lastActiveIndex;

      if (bestIndex === -1) {
        let minC = Infinity;
        for (let i = 0; i < calculatedPositions.length; i++) {
          if (calculatedPositions[i].distC < minC) {
            minC = calculatedPositions[i].distC;
            bestIndex = i;
          }
        }
      }

      group.lastActiveIndex = bestIndex;
      const availableClones = [...group.clones];

      calculatedPositions.forEach((calc, index) => {
        const isH = index === bestIndex;
        const el = isH ? group.realElement : availableClones.pop();
        if (!el) return;
        el.style.transform = `translate(${calc.fX}px, ${calc.fY}px)`;
        el.style.opacity = calc.vis ? "1" : "0";
        el.style.pointerEvents = calc.vis ? "auto" : "none";

        const inP = parallax?.enabled && isH ? parallax.child ?? 1 : 0;
        const gP = parallax?.general ?? 1;
        const tx = (0.5 - mouse.current.x.c) * calc.item.ease * 20 * gP * inP;
        const ty = (0.5 - mouse.current.y.c) * calc.item.ease * 20 * gP * inP;
        const firstChild = el.firstElementChild;
        if (firstChild) firstChild.style.transform = inP === 0 ? "none" : `translate(${tx}%, ${ty}%)`;
      });
    });

    scroll.current.last.x = scroll.current.current.x;
    scroll.current.last.y = scroll.current.current.y;
  };

  useEffect(() => {
    const animate = () => {
      render();
      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        ...style,
        position: "relative",
        width: "0px",
        height: "0px",
        overflow: "visible",
        backgroundColor: "transparent",
        transform: "translateZ(0)",
        transformStyle: "flat"
      }}
    />
  );
}
