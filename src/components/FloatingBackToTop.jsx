import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MOBILE_TABLET_QUERY = "(max-width: 1024px)";

function FloatingBackToTop() {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(MOBILE_TABLET_QUERY).matches
  );
  const [isVisible, setIsVisible] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(MOBILE_TABLET_QUERY).matches &&
      window.scrollY > 400
  );
  const [isTapped, setIsTapped] = useState(false);
  const [tapSequence, setTapSequence] = useState(0);
  const tapTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (tapTimerRef.current !== null) {
        window.clearTimeout(tapTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_TABLET_QUERY);
    const updateViewport = (event) => {
      setIsMobileOrTablet(event.matches);
      if (!event.matches) setIsVisible(false);
    };

    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (!isMobileOrTablet) return undefined;

    let frame = null;
    const updateVisibility = () => {
      if (frame !== null) return;

      frame = window.requestAnimationFrame(() => {
        frame = null;
        setIsVisible(window.scrollY > 400);
      });
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [isMobileOrTablet]);

  if (!isMobileOrTablet) return null;

  const handleClick = () => {
    setIsTapped(true);
    setTapSequence((sequence) => sequence + 1);
    if (tapTimerRef.current !== null) {
      window.clearTimeout(tapTimerRef.current);
    }
    tapTimerRef.current = window.setTimeout(() => {
      setIsTapped(false);
      tapTimerRef.current = null;
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 300 : 600);

    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return createPortal(
    <button
      type="button"
      className={`floating-back-to-top${isVisible ? " is-visible" : ""}${isTapped ? " is-tapped" : ""}`}
      aria-label="Back to top"
      tabIndex={isVisible ? 0 : -1}
      onClick={handleClick}
    >
      <span className="floating-back-to-top-arrow" aria-hidden="true">
        ↑
      </span>
      {isTapped && (
        <span
          key={tapSequence}
          className="floating-back-to-top-ripple"
          aria-hidden="true"
        />
      )}
    </button>,
    document.body
  );
}

export default FloatingBackToTop;
