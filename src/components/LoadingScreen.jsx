import { useEffect, useRef, useState } from "react";

const DEFAULT_LOGO = "/WebLogo-white.png";
const FALLBACK_LOGO = "/WebLogo.png";
const DEFAULT_MIN_DURATION = 2200;
const DEFAULT_BACKGROUND = "#000000";
const DEFAULT_BAR_COLOR = "#16c76a";
const LOAD_CONTINUE_DURATION = 450;
const EXIT_CONTENT_DELAY = 250;
const EXIT_DURATION = 2200;
const REDUCED_MOTION_DURATION = 600;
const REDUCED_EXIT_DURATION = 600;

const ticks = [
  { angle: -4, start: 153, end: 183 },
  { angle: 31, start: 157, end: 184 },
  { angle: 68, start: 151, end: 180 },
  { angle: 103, start: 158, end: 186 },
  { angle: 139, start: 154, end: 179 },
  { angle: 176, start: 157, end: 185 },
  { angle: 213, start: 152, end: 183 },
  { angle: 249, start: 156, end: 181 },
  { angle: 286, start: 150, end: 184 },
  { angle: 322, start: 158, end: 186 },
];

function easeOutCubic(value) {
  return 1 - (1 - value) ** 3;
}

function LoadingScreen({
  logo = DEFAULT_LOGO,
  minDuration = DEFAULT_MIN_DURATION,
  background = DEFAULT_BACKGROUND,
  barColor = DEFAULT_BAR_COLOR,
  onDone,
}) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("loading");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [usingFallbackLogo, setUsingFallbackLogo] = useState(false);
  const onDoneRef = useRef(onDone);
  const animationFrameRef = useRef(null);
  const timersRef = useRef([]);
  const finishedRef = useRef(false);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (finishedRef.current) return undefined;

    setProgress(0);
    setPhase("loading");
    setUsingFallbackLogo(false);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setReduceMotion(reducedMotion);

    const duration = Math.max(
      0,
      reducedMotion ? Math.min(minDuration, REDUCED_MOTION_DURATION) : minDuration
    );
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let cancelled = false;
    let loadComplete = document.readyState === "complete";
    let loadTime = loadComplete ? performance.now() : null;
    let continueStart = null;
    let completionScheduled = false;
    const startTime = performance.now();

    const restoreScroll = () => {
      document.body.style.overflow = previousOverflow;
    };

    const schedule = (callback, delay) => {
      const timer = window.setTimeout(() => {
        if (!cancelled) callback();
      }, delay);
      timersRef.current.push(timer);
    };

    const finish = () => {
      if (cancelled) return;
      finishedRef.current = true;
      setPhase("done");
      restoreScroll();
      onDoneRef.current?.();
    };

    const handleLoad = () => {
      if (loadComplete) return;
      loadComplete = true;
      loadTime = performance.now();
    };

    if (!loadComplete) {
      window.addEventListener("load", handleLoad);
    }

    const tick = (now) => {
      if (cancelled) return;

      const elapsed = now - startTime;
      let nextProgress;

      if (elapsed < duration) {
        nextProgress = easeOutCubic(elapsed / duration) * 90;
      } else if (!loadComplete) {
        nextProgress = 90;
      } else {
        if (continueStart === null) {
          continueStart = Math.max(now, loadTime ?? now);
        }
        const continueDuration = reducedMotion ? 1 : LOAD_CONTINUE_DURATION;
        const continueProgress = Math.min(
          (now - continueStart) / continueDuration,
          1
        );
        nextProgress = 90 + easeOutCubic(continueProgress) * 10;
      }

      nextProgress = Math.min(100, Math.max(0, nextProgress));
      setProgress(nextProgress);

      if (nextProgress >= 100 && !completionScheduled) {
        completionScheduled = true;
        animationFrameRef.current = null;
        schedule(() => setPhase("exiting"), EXIT_CONTENT_DELAY);
        schedule(
          finish,
          EXIT_CONTENT_DELAY +
            (reducedMotion ? REDUCED_EXIT_DURATION : EXIT_DURATION)
        );
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    animationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.removeEventListener("load", handleLoad);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
      restoreScroll();
    };
  }, [minDuration]);

  if (phase === "done") return null;

  const displayProgress = String(Math.floor(progress)).padStart(3, "0");
  const exitClass = phase === "exiting" ? " loading-screen--exiting" : "";
  const motionClass = reduceMotion ? " loading-screen--reduced-motion" : "";
  const logoSrc = usingFallbackLogo ? FALLBACK_LOGO : logo;

  return (
    <div
      className={`loading-screen${exitClass}${motionClass}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
      style={{ "--loader-background": background }}
    >
      <div className="loading-screen__backdrop" aria-hidden="true" />

      <main className="loading-screen__content">
        <div className="loading-screen__hud">
          <svg
            className="loading-screen__svg"
            viewBox="0 0 400 400"
            aria-hidden="true"
          >
            <defs>
              <path
                id="loading-screen-text-path"
                d="M 200 10 a 190 190 0 1 1 0 380 a 190 190 0 1 1 0 -380"
              />
            </defs>

            <g className="loading-screen__outer-orbit">
              <circle
                className="loading-screen__outer-ring"
                cx="200"
                cy="200"
                r="190"
              />
              <text className="loading-screen__ring-text">
                <textPath href="#loading-screen-text-path" startOffset="0%">
                  LOADING PORTFOLIO · CHRISTIAN BARCOMA · 2026 · LOADING
                  PORTFOLIO · CHRISTIAN BARCOMA · 2026 · LOADING PORTFOLIO ·
                  CHRISTIAN BARCOMA · 2026 · LOADING PORTFOLIO · CHRISTIAN
                  BARCOMA · 2026 · LOADING PORTFOLIO · CHRISTIAN BARCOMA · 2026
                  ·
                </textPath>
              </text>
            </g>

            <g className="loading-screen__second-orbit">
              <circle
                className="loading-screen__second-ring"
                cx="200"
                cy="200"
                r="148"
              />
            </g>

            <g className="loading-screen__ticks">
              {ticks.map(({ angle, start, end }, index) => (
                <line
                  key={angle}
                  className="loading-screen__tick"
                  style={{ "--tick-delay": `${index * -0.37}s` }}
                  x1="0"
                  y1={-start}
                  x2="0"
                  y2={-end}
                  transform={`rotate(${angle} 200 200) translate(200 200)`}
                />
              ))}
            </g>

            <circle
              className="loading-screen__faint-inner-ring"
              cx="200"
              cy="200"
              r="82"
            />
            <circle
              className="loading-screen__inner-ring"
              cx="200"
              cy="200"
              r="76"
            />
          </svg>

          <img
            className="loading-screen__logo"
            src={logoSrc}
            alt=""
            aria-hidden="true"
            draggable="false"
            style={{
              "--loader-logo-filter": usingFallbackLogo
                ? "brightness(0) invert(1)"
                : "brightness(1)",
            }}
            onError={() => {
              if (!usingFallbackLogo && logo === DEFAULT_LOGO) {
                setUsingFallbackLogo(true);
              }
            }}
          />
        </div>

        <div className="loading-screen__readout">
          <div
            className="loading-screen__bar"
            aria-hidden="true"
            style={{ "--loader-bar-color": barColor }}
          >
            <div
              className="loading-screen__bar-fill"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
          <div className="loading-screen__counter" aria-hidden="true">
            {displayProgress}
          </div>
        </div>
      </main>

      <style>{`
        .loading-screen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          overflow: hidden;
          isolation: isolate;
          perspective: 1200px;
          pointer-events: auto;
        }

        .loading-screen__backdrop {
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--loader-background, #000000);
        }

        .loading-screen__content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .loading-screen__hud {
          position: relative;
          width: min(clamp(400px, 59vw, 660px), 85vw, 60vh);
          aspect-ratio: 1;
          transform-style: preserve-3d;
          animation: loading-screen__hud-enter 1s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .loading-screen__svg {
          display: block;
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .loading-screen__outer-orbit,
        .loading-screen__second-orbit {
          transform-box: fill-box;
          transform-origin: 50% 50%;
        }

        .loading-screen__outer-orbit {
          animation: loading-screen__rotate-clockwise 60s linear infinite;
        }

        .loading-screen__outer-ring {
          fill: none;
          stroke: rgba(255, 255, 255, 0.28);
          stroke-width: 1;
          stroke-dasharray: 1193.8;
          stroke-dashoffset: 1193.8;
          animation: loading-screen__draw-ring 1.4s
            cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
        }

        .loading-screen__ring-text {
          fill: rgba(255, 255, 255, 0.35);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco,
            Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 8px;
          letter-spacing: 0.3em;
          opacity: 0.35;
        }

        .loading-screen__second-orbit {
          animation: loading-screen__rotate-counterclockwise 40s linear
            infinite;
        }

        .loading-screen__second-ring {
          fill: none;
          stroke: rgba(255, 255, 255, 0.18);
          stroke-width: 1;
          stroke-dasharray: 2 4;
        }

        .loading-screen__ticks {
          fill: none;
          stroke: rgba(255, 255, 255, 0.2);
          stroke-width: 1;
          animation: loading-screen__tick-pulse 3.8s ease-in-out infinite
            alternate;
        }

        .loading-screen__tick {
          animation: loading-screen__tick-flicker 2.8s ease-in-out
            var(--tick-delay, 0s) infinite alternate;
        }

        .loading-screen__faint-inner-ring,
        .loading-screen__inner-ring {
          fill: none;
          transform-box: fill-box;
          transform-origin: 50% 50%;
        }

        .loading-screen__faint-inner-ring {
          stroke: rgba(255, 255, 255, 0.12);
          stroke-width: 1;
        }

        .loading-screen__inner-ring {
          stroke: rgba(255, 255, 255, 0.35);
          stroke-width: 1;
        }

        .loading-screen__logo {
          position: absolute;
          top: 50%;
          left: 50%;
          display: block;
          width: 23.3%;
          height: auto;
          max-width: 100%;
          object-fit: contain;
          user-select: none;
          -webkit-user-drag: none;
          filter: var(--loader-logo-filter, brightness(1));
          transform: translate(-50%, -50%);
          animation:
            loading-screen__logo-in 1s
              cubic-bezier(0.22, 1, 0.36, 1) 0.15s both,
            loading-screen__logo-breathe 3s ease-in-out 1.15s infinite;
        }

        .loading-screen__bar {
          position: relative;
          width: clamp(170px, 24vw, 240px);
          height: 1px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.18);
        }

        .loading-screen__bar-fill {
          position: absolute;
          inset: 0;
          background: var(--loader-bar-color, #16c76a);
          transform: scaleX(0);
          transform-origin: left center;
          will-change: transform;
        }

        .loading-screen__readout {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(12px, 1.875vh, 15px);
          margin-top: clamp(28px, 4.4vh, 35px);
        }

        .loading-screen__counter {
          color: rgba(255, 255, 255, 0.6);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco,
            Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 16px;
          line-height: 1;
          letter-spacing: 0.3em;
          font-variant-numeric: tabular-nums;
          font-feature-settings: "tnum" 1;
        }

        .loading-screen--exiting {
          pointer-events: none;
        }

        .loading-screen--exiting .loading-screen__logo {
          animation: loading-screen__content-fade 0.3s ease forwards;
        }

        .loading-screen--exiting .loading-screen__readout {
          animation: loading-screen__content-fade 0.3s ease forwards;
        }

        .loading-screen--exiting .loading-screen__hud {
          animation: loading-screen__hud-exit 1.3s
            cubic-bezier(0.65, 0, 0.35, 1) 0.3s forwards;
        }

        .loading-screen--exiting .loading-screen__backdrop {
          animation: loading-screen__backdrop-fade 0.6s ease 1.1s forwards;
        }

        .loading-screen--reduced-motion .loading-screen__hud {
          animation: none;
          opacity: 1;
          transform: none;
        }

        .loading-screen--reduced-motion .loading-screen__outer-orbit,
        .loading-screen--reduced-motion .loading-screen__second-orbit,
        .loading-screen--reduced-motion .loading-screen__ticks,
        .loading-screen--reduced-motion .loading-screen__tick,
        .loading-screen--reduced-motion .loading-screen__logo {
          animation: none;
        }

        .loading-screen--reduced-motion .loading-screen__outer-ring {
          stroke-dashoffset: 0;
          animation: none;
        }

        .loading-screen--reduced-motion.loading-screen--exiting
          .loading-screen__hud,
        .loading-screen--reduced-motion.loading-screen--exiting
          .loading-screen__backdrop {
          animation: loading-screen__simple-fade 0.6s ease forwards;
        }

        .loading-screen--reduced-motion.loading-screen--exiting
          .loading-screen__logo,
        .loading-screen--reduced-motion.loading-screen--exiting
          .loading-screen__readout {
          animation: loading-screen__content-fade 0.3s ease forwards;
        }

        @keyframes loading-screen__hud-enter {
          from {
            opacity: 0;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes loading-screen__draw-ring {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes loading-screen__rotate-clockwise {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes loading-screen__rotate-counterclockwise {
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes loading-screen__tick-pulse {
          from {
            opacity: 0.5;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes loading-screen__tick-flicker {
          from {
            opacity: 0.55;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes loading-screen__logo-in {
          from {
            opacity: 0;
            transform: translate(-50%, calc(-50% + 14px));
            filter: blur(6px) var(--loader-logo-filter, brightness(1));
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
            filter: blur(0) var(--loader-logo-filter, brightness(1));
          }
        }

        @keyframes loading-screen__logo-breathe {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.72;
          }
        }

        @keyframes loading-screen__content-fade {
          to {
            opacity: 0;
          }
        }

        @keyframes loading-screen__hud-exit {
          0% {
            opacity: 1;
            transform: rotateX(0deg) rotateZ(0deg) scale(1);
          }
          42% {
            opacity: 1;
            transform: rotateX(70deg) rotateZ(-35deg) scale(1);
          }
          78% {
            opacity: 1;
            transform: rotateX(88deg) rotateZ(-35deg) scaleY(0.02);
          }
          100% {
            opacity: 0;
            transform: rotateX(88deg) rotateZ(0deg) scaleX(0) scaleY(0.02);
          }
        }

        @keyframes loading-screen__backdrop-fade {
          to {
            opacity: 0;
          }
        }

        @keyframes loading-screen__simple-fade {
          to {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default LoadingScreen;
