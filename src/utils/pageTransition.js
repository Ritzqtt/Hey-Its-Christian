import { lockPageScroll, unlockPageScroll } from "./pageTransitionScrollLock";

export const PAGE_EXIT_DELAY = 350;
export const PAGE_ENTER_DURATION = 900;

let activeTransition = null;
let nextTransitionId = 0;

function clearTransition() {
  if (!activeTransition) return;

  window.clearTimeout(activeTransition.exitTimer);
  window.clearTimeout(activeTransition.fallbackTimer);
  activeTransition.source?.classList.remove("page-transition-leaving");
  activeTransition.target?.classList.remove("page-transition-entering");

  if (activeTransition.target) {
    activeTransition.target.style.willChange =
      activeTransition.previousWillChange ?? "";
    if (activeTransition.finishEntrance) {
      activeTransition.target.removeEventListener(
        "animationend",
        activeTransition.finishEntrance
      );
    }
  }

  window.removeEventListener("popstate", activeTransition.handlePopState);
  activeTransition = null;
  unlockPageScroll();
}

export function isActivePageTransition(id) {
  return Boolean(activeTransition && activeTransition.id === id);
}

export function startPageTransition(source, targetId, navigate, targetUrl, replace) {
  if (activeTransition) return false;

  const id = `page-transition-${++nextTransitionId}`;
  const transition = {
    id,
    targetId,
    source,
    target: null,
    exitTimer: null,
    fallbackTimer: null,
    previousWillChange: "",
    handlePopState: clearTransition,
  };
  activeTransition = transition;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    activeTransition = null;
    navigate(targetUrl, { replace });
    return true;
  }

  lockPageScroll();
  source.classList.add("page-transition-leaving");
  window.addEventListener("popstate", transition.handlePopState);

  transition.exitTimer = window.setTimeout(() => {
    if (activeTransition !== transition) return;

    source.classList.remove("page-transition-leaving");
    transition.source = null;
    transition.fallbackTimer = window.setTimeout(
      clearTransition,
      PAGE_ENTER_DURATION + 700
    );

    navigate(targetUrl, {
      replace,
      state: { pageTransitionId: id },
    });
  }, PAGE_EXIT_DELAY);

  return true;
}

export function startPageTransitionEntrance(target, id, targetTop) {
  if (!isActivePageTransition(id)) return false;

  const transition = activeTransition;
  if (!target) {
    clearTransition();
    return false;
  }

  window.scrollTo(0, Math.max(0, targetTop));
  transition.target = target;
  transition.previousWillChange = target.style.willChange;
  target.style.willChange = "transform, opacity";
  target.classList.add("page-transition-entering");

  const finish = (event) => {
    if (
      event &&
      (event.target !== target || event.animationName !== "pageTransitionEnter")
    ) {
      return;
    }

    target.removeEventListener("animationend", finish);
    if (activeTransition === transition) clearTransition();
  };

  transition.finishEntrance = finish;
  target.addEventListener("animationend", finish);
  transition.fallbackTimer = window.setTimeout(() => {
    finish();
  }, PAGE_ENTER_DURATION + 300);
  return true;
}

export function finishPageTransition() {
  clearTransition();
}
