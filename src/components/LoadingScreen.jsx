import { useEffect, useRef, useState } from "react";

const DEFAULT_LOGO = "/WebLogo-white.png";
const DEFAULT_MIN_DURATION = 2200;
const DEFAULT_BACKGROUND = "#000000";
const DEFAULT_BAR_COLOR = "#16c76a";

// Used only when the white logo has not been added to public/ yet.
const FALLBACK_LOGO = "/WebLogo.png";
const CONTINUE_DURATION = 450;
const HOLD_AFTER_COMPLETE = 250;
const EXIT_DURATION = 900;
const REDUCED_MOTION_DURATION = 600;

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
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
  const [failedLogo, setFailedLogo] = useState(null);

  const onDoneRef = useRef(onDone);
  const rafRef = useRef(null);
  const timersRef = useRef([]);
  const finishedRef = useRef(false);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (finishedRef.current) return undefined;

    setProgress(0);
    setPhase("loading");

    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const reduceMotion = motionQuery.matches;
    const duration = Math.max(
      0,
      reduceMotion
        ? Math.min(minDuration, REDUCED_MOTION_DURATION)
        : minDuration
    );

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let cancelled = false;
    let scrollRestored = false;
    let loadComplete = false;
    let loadTime = null;
    let continueStart = null;
    let completionScheduled = false;

    const restoreScroll = () => {
      if (scrollRestored) return;
      scrollRestored = true;
      document.body.style.overflow = previousOverflow;
    };

    const clearTimers = () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };

    const schedule = (callback, delay) => {
      const timer = window.setTimeout(() => {
        if (!cancelled) callback();
      }, delay);

      timersRef.current.push(timer);
      return timer;
    };

    const finish = () => {
      if (cancelled) return;

      finishedRef.current = true;
      restoreScroll();
      setPhase("done");
      onDoneRef.current?.();
    };

    const handleLoad = () => {
      if (loadComplete) return;

      loadComplete = true;
      loadTime = performance.now();
    };

    window.addEventListener("load", handleLoad, { once: true });

    if (document.readyState === "complete") {
      handleLoad();
    }

    const startTime = performance.now();

    const tick = (now) => {
      if (cancelled) return;

      const elapsed = now - startTime;
      let value;

      if (elapsed < duration) {
        value = easeOutCubic(elapsed / duration) * 90;
      } else if (!loadComplete) {
        // Hold just below the finish line until the page has really loaded.
        value = 90;
      } else {
        if (continueStart === null) {
          continueStart = Math.max(now, loadTime ?? now);
        }

        const continueElapsed = now - continueStart;
        const continueDuration = reduceMotion ? 1 : CONTINUE_DURATION;

        value =
          90 +
          easeOutCubic(
            Math.min(continueElapsed / continueDuration, 1)
          ) *
            10;
      }

      const nextProgress = Math.min(100, Math.max(0, value));
      setProgress(nextProgress);

      if (nextProgress >= 100 && !completionScheduled) {
        completionScheduled = true;
        rafRef.current = null;

        if (reduceMotion) {
          finish();
        } else {
          schedule(() => setPhase("exiting"), HOLD_AFTER_COMPLETE);
          schedule(
            finish,
            HOLD_AFTER_COMPLETE + EXIT_DURATION
          );
        }

        return;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;

      window.removeEventListener("load", handleLoad);

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      clearTimers();
      restoreScroll();
    };
  }, [minDuration]);

  if (phase === "done") return null;

  const displayProgress = String(
    Math.min(100, Math.floor(progress))
  ).padStart(3, "0");

  const usingLogoFallback =
    logo === DEFAULT_LOGO && failedLogo === DEFAULT_LOGO;
  const logoSrc = usingLogoFallback ? FALLBACK_LOGO : logo;
  const logoStyle = usingLogoFallback
    ? { "--loader-logo-filter": "brightness(0) invert(1)" }
    : undefined;

  return (
    <div
      className={`loader-overlay${
        phase === "exiting" ? " loader-overlay--exiting" : ""
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
      style={{ background }}
    >
      <img
        className="loader-logo"
        src={logoSrc}
        alt=""
        draggable="false"
        style={logoStyle}
        onError={() => {
          if (logo === DEFAULT_LOGO) {
            setFailedLogo(DEFAULT_LOGO);
          }
        }}
      />

      <div className="loader-bar" aria-hidden="true">
        <div
          className="loader-bar-fill"
          style={{
            background: barColor,
            transform: `scaleX(${progress / 100})`,
          }}
        />
      </div>

      <div className="loader-counter" aria-hidden="true">
        {displayProgress}
      </div>

      <style>{`
        .loader-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 28px;
          padding: 24px;
          background: #000000;
          overflow: hidden;
          will-change: transform;
        }

        .loader-logo {
          display: block;
          width: clamp(150px, 24vw, 240px);
          height: auto;
          max-width: 100%;
          object-fit: contain;
          user-select: none;
          -webkit-user-drag: none;
          filter: var(--loader-logo-filter, brightness(1));
          animation:
            loader-logo-in 1.1s cubic-bezier(0.22, 1, 0.36, 1) both,
            loader-logo-breathe 3s ease-in-out 1.1s infinite;
        }

        @keyframes loader-logo-in {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.97);
            filter: blur(6px) var(--loader-logo-filter, brightness(1));
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0) var(--loader-logo-filter, brightness(1));
          }
        }

        @keyframes loader-logo-breathe {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.72;
          }
        }

        .loader-bar {
          position: relative;
          width: clamp(120px, 18vw, 180px);
          height: 1px;
          background: rgba(255, 255, 255, 0.18);
          overflow: hidden;
        }

        .loader-bar-fill {
          position: absolute;
          inset: 0;
          transform-origin: left center;
          transform: scaleX(0);
          will-change: transform;
        }

        .loader-counter {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco,
            Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 12px;
          line-height: 1;
          letter-spacing: 0.25em;
          font-variant-numeric: tabular-nums;
          font-feature-settings: "tnum" 1;
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
        }

        .loader-overlay--exiting {
          animation: loader-curtain 0.9s cubic-bezier(0.76, 0, 0.24, 1)
            forwards;
        }

        .loader-overlay--exiting .loader-logo,
        .loader-overlay--exiting .loader-bar,
        .loader-overlay--exiting .loader-counter {
          animation: loader-content-out 0.35s ease forwards;
        }

        @keyframes loader-curtain {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-100%);
          }
        }

        @keyframes loader-content-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .loader-logo {
            animation: none;
            opacity: 1;
            transform: none;
            filter: var(--loader-logo-filter, brightness(1));
          }

          .loader-overlay--exiting {
            animation: none;
          }

          .loader-overlay--exiting .loader-logo,
          .loader-overlay--exiting .loader-bar,
          .loader-overlay--exiting .loader-counter {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default LoadingScreen;
