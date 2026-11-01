import { useLayoutEffect } from "react";

function useTimelineFill(timelineRef, markerRefs, singleMarker = false) {
  useLayoutEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return undefined;

    const markers = Object.values(markerRefs.current).filter(Boolean);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    let frame = null;
    let transitionFrame = null;
    let markerCenters = [];
    let disposed = false;
    let resizeObserver = null;

    const measure = () => {
      markerCenters = markers.map((marker) => {
        let offset = 0;
        let element = marker;

        while (element && element !== timeline) {
          offset += element.offsetTop;
          element = element.offsetParent;
        }

        return offset + marker.offsetHeight / 2;
      });

      const firstCenter = markerCenters[0] ?? 0;
      const lastCenter = markerCenters[markerCenters.length - 1] ?? firstCenter;
      timeline.style.setProperty("--timeline-line-top", `${firstCenter}px`);
      timeline.style.setProperty(
        "--timeline-line-length",
        `${Math.max(0, lastCenter - firstCenter)}px`
      );
    };

    const updateProgress = () => {
      frame = null;
      const timelineTop = timeline.getBoundingClientRect().top + window.scrollY;
      const scrollPosition = window.scrollY + window.innerHeight * 0.68;
      const firstCenter = markerCenters[0] ?? 0;
      const lastCenter = markerCenters[markerCenters.length - 1] ?? firstCenter;
      const distance = lastCenter - firstCenter;
      const progressRange = singleMarker
        ? timeline.offsetHeight
        : distance;
      const progressStart = singleMarker ? 0 : firstCenter;
      const progress = progressRange > 0
        ? Math.min(
            1,
            Math.max(
              0,
              (scrollPosition - timelineTop - progressStart) / progressRange
            )
          )
        : scrollPosition >= timelineTop + firstCenter
          ? 1
          : 0;
      const fillPosition = singleMarker
        ? progress * timeline.offsetHeight
        : firstCenter + progress * distance;

      timeline.style.setProperty("--timeline-progress", progress.toString());

      markers.forEach((marker, index) => {
        const reached = fillPosition >= markerCenters[index];
        const value = reached ? "true" : "false";
        if (marker.dataset.reached !== value) {
          marker.dataset.reached = value;
        }
      });
    };

    function scheduleUpdate() {
      if (
        disposed ||
        frame !== null ||
        timeline.closest(".page-transition-entering")
      ) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = null;
        measure();
        updateProgress();
      });
    }

    const handlePageTransitionEnd = (event) => {
      if (event.animationName === "pageTransitionEnter") {
        transitionFrame = window.requestAnimationFrame(() => {
          transitionFrame = null;
          scheduleUpdate();
        });
      }
    };

    if (!timeline.closest(".page-transition-entering")) {
      measure();
      updateProgress();
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    document.addEventListener("animationend", handlePageTransitionEnd, true);

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(scheduleUpdate);
      markers.forEach((marker) => resizeObserver.observe(marker));
      resizeObserver.observe(timeline);
    }

    const fonts = document.fonts;
    fonts?.ready.then(scheduleUpdate);
    fonts?.addEventListener?.("loadingdone", scheduleUpdate);
    document.addEventListener("load", scheduleUpdate, true);

    if (reduceMotion) {
      timeline.classList.add("timeline-reduced-motion");
    }

    return () => {
      disposed = true;
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      document.removeEventListener(
        "animationend",
        handlePageTransitionEnd,
        true
      );
      fonts?.removeEventListener?.("loadingdone", scheduleUpdate);
      document.removeEventListener("load", scheduleUpdate, true);
      resizeObserver?.disconnect();

      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
      if (transitionFrame !== null) {
        window.cancelAnimationFrame(transitionFrame);
      }

      timeline.classList.remove("timeline-reduced-motion");
      timeline.style.removeProperty("--timeline-progress");
      timeline.style.removeProperty("--timeline-line-top");
      timeline.style.removeProperty("--timeline-line-length");
      markers.forEach((marker) => delete marker.dataset.reached);
    };
  }, [timelineRef, markerRefs, singleMarker]);
}

export default useTimelineFill;
