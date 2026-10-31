import { useEffect, useRef } from "react";

const DEFAULT_DENSITY = 1 / 12000;
// Under 768px this yields roughly 1 node per 20,000px² by default.
const MOBILE_DENSITY_RATIO = 0.6;
const MAX_DPR = 2;
const TAU = Math.PI * 2;

function ParticleNetwork({
  density = DEFAULT_DENSITY,
  linkDistance = 140,
  cursorRadius = 180,
  nodeSpeed = 0.35,
  color = "255,255,255",
  background = "#000000",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let reduceMotion = motionQuery.matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes = [];
    let animationId = null;
    let lastTime = 0;

    const pointer = {
      x: -10000,
      y: -10000,
      active: false,
    };

    const random = (min, max) => min + Math.random() * (max - min);

    // Nodes keep a constant drift vector plus a damped "pull" vector, so the
    // background keeps moving even after the cursor stops attracting them.
    const createNode = () => {
      const angle = Math.random() * TAU;
      const speed = nodeSpeed * random(0.6, 1.4);

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        driftX: Math.cos(angle) * speed,
        driftY: Math.sin(angle) * speed,
        pullX: 0,
        pullY: 0,
        radius: random(1.5, 2.5),
      };
    };

    const buildNodes = () => {
      const effectiveDensity =
        width < 768 ? density * MOBILE_DENSITY_RATIO : density;
      const count = Math.max(
        12,
        Math.round(width * height * effectiveDensity)
      );

      nodes = Array.from({ length: count }, createNode);
    };

    const resizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildNodes();
    };

    const resetPointer = () => {
      pointer.x = -10000;
      pointer.y = -10000;
      pointer.active = false;
    };

    const handlePointerMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };

    const handlePointerDown = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };

    const handlePointerUp = (event) => {
      // Touch has no hover state, so release the node cluster.
      if (event.pointerType !== "mouse") {
        resetPointer();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Links between nodes. Distance is compared squared to skip sqrt.
      const linkSq = linkDistance * linkDistance;

      ctx.lineWidth = 0.8;

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];

        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distanceSq = dx * dx + dy * dy;

          if (distanceSq >= linkSq) continue;

          const alpha = (1 - distanceSq / linkSq) * 0.32;

          ctx.strokeStyle = `rgba(${color}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // The cursor acts as an invisible node.
      if (pointer.active) {
        const cursorSq = cursorRadius * cursorRadius;

        for (let i = 0; i < nodes.length; i += 1) {
          const node = nodes[i];
          const dx = node.x - pointer.x;
          const dy = node.y - pointer.y;
          const distanceSq = dx * dx + dy * dy;

          if (distanceSq >= cursorSq) continue;

          const alpha = (1 - distanceSq / cursorSq) * 0.55;

          ctx.strokeStyle = `rgba(${color}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();
        }
      }

      // Nodes on top of the links.
      ctx.fillStyle = `rgba(${color}, 0.9)`;

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, TAU);
        ctx.fill();
      }
    };

    const step = (time) => {
      const delta = lastTime
        ? Math.min((time - lastTime) / 16.667, 2)
        : 1;

      lastTime = time;

      const cursorSq = cursorRadius * cursorRadius;
      // Per-frame damping for the attraction component.
      const damping = Math.pow(0.9, delta);
      const maxPullSpeed = 2.2;
      const maxTotalSpeed = 3;

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];

        if (pointer.active) {
          const dx = pointer.x - node.x;
          const dy = pointer.y - node.y;
          const distanceSq = dx * dx + dy * dy;

          if (distanceSq < cursorSq && distanceSq > 0.0001) {
            const distance = Math.sqrt(distanceSq);
            const falloff = 1 - distance / cursorRadius;
            // Quadratic falloff: strongest at the cursor, zero at the edge.
            const force = falloff * falloff * 0.22;

            node.pullX += (dx / distance) * force * delta;
            node.pullY += (dy / distance) * force * delta;
          }
        }

        node.pullX *= damping;
        node.pullY *= damping;

        const pullSpeed = Math.hypot(node.pullX, node.pullY);

        if (pullSpeed > maxPullSpeed) {
          const scale = maxPullSpeed / pullSpeed;
          node.pullX *= scale;
          node.pullY *= scale;
        }

        let vx = node.driftX + node.pullX;
        let vy = node.driftY + node.pullY;
        const totalSpeed = Math.hypot(vx, vy);

        if (totalSpeed > maxTotalSpeed) {
          const scale = maxTotalSpeed / totalSpeed;
          vx *= scale;
          vy *= scale;
        }

        node.x += vx * delta;
        node.y += vy * delta;

        // Bounce at the edges so the field never empties out.
        if (node.x <= 0) {
          node.x = 0;
          node.driftX = Math.abs(node.driftX);
          node.pullX = Math.abs(node.pullX);
        } else if (node.x >= width) {
          node.x = width;
          node.driftX = -Math.abs(node.driftX);
          node.pullX = -Math.abs(node.pullX);
        }

        if (node.y <= 0) {
          node.y = 0;
          node.driftY = Math.abs(node.driftY);
          node.pullY = Math.abs(node.pullY);
        } else if (node.y >= height) {
          node.y = height;
          node.driftY = -Math.abs(node.driftY);
          node.pullY = -Math.abs(node.pullY);
        }
      }

      draw();
      animationId = requestAnimationFrame(step);
    };

    const startAnimation = () => {
      if (animationId === null) {
        lastTime = 0;
        animationId = requestAnimationFrame(step);
      }
    };

    const stopAnimation = () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    };

    const handleResize = () => {
      resizeCanvas();

      if (reduceMotion) {
        draw();
      }
    };

    const handleMotionChange = () => {
      reduceMotion = motionQuery.matches;

      if (reduceMotion) {
        stopAnimation();
        draw();
      } else {
        startAnimation();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation();
      } else if (!reduceMotion) {
        startAnimation();
      }
    };

    const handleBlur = () => {
      resetPointer();
    };

    resizeCanvas();

    if (reduceMotion) {
      draw();
    } else {
      startAnimation();
    }

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    window.addEventListener("pointerup", handlePointerUp, {
      passive: true,
    });
    window.addEventListener("pointercancel", handlePointerUp, {
      passive: true,
    });
    document.addEventListener("pointerleave", resetPointer);
    window.addEventListener("blur", handleBlur);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
    window.addEventListener("resize", handleResize);

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener("change", handleMotionChange);
    }

    return () => {
      stopAnimation();

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      document.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      window.removeEventListener("resize", handleResize);

      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener(
          "change",
          handleMotionChange
        );
      }
    };
  }, [
    density,
    linkDistance,
    cursorRadius,
    nodeSpeed,
    color,
    background,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="particle-network"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
        display: "block",
        background,
      }}
    />
  );
}

export default ParticleNetwork;
