import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { startPageTransition } from "../utils/pageTransition";

function usePageTransition(onNavigate) {
  const location = useLocation();
  const navigate = useNavigate();

  return useCallback(
    (event, to) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = new URL(to, window.location.href);
      const targetId = target.hash.slice(1) ||
        (target.pathname === "/" ? "home" : "");
      const targetUrl = `${target.pathname}${target.search}${target.hash}`;
      const isSameLocation =
        target.pathname === location.pathname &&
        target.search === location.search &&
        target.hash === location.hash;

      if (isSameLocation) {
        event.preventDefault();
        navigate(targetUrl, { replace: true, state: location.state });
        onNavigate?.();
        return;
      }

      if (location.pathname !== "/") {
        onNavigate?.();
        return;
      }

      const source = document.querySelector(".home-content");

      if (!source) return;

      event.preventDefault();
      const accepted = startPageTransition(
        source,
        targetId,
        navigate,
        targetUrl,
        location.pathname === target.pathname &&
          location.hash === target.hash
      );

      if (accepted) onNavigate?.();
    },
    [
      location.hash,
      location.pathname,
      location.search,
      location.state,
      navigate,
      onNavigate,
    ]
  );
}

export default usePageTransition;
