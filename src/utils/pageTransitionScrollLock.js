let scrollLocked = false;

function preventScroll(event) {
  event.preventDefault();
}

function preventKeyboardScroll(event) {
  if (
    [" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(
      event.key
    )
  ) {
    event.preventDefault();
  }
}

export function lockPageScroll() {
  if (scrollLocked) return;
  scrollLocked = true;
  window.addEventListener("wheel", preventScroll, { passive: false });
  window.addEventListener("touchmove", preventScroll, { passive: false });
  window.addEventListener("keydown", preventKeyboardScroll);
}

export function unlockPageScroll() {
  if (!scrollLocked) return;
  scrollLocked = false;
  window.removeEventListener("wheel", preventScroll);
  window.removeEventListener("touchmove", preventScroll);
  window.removeEventListener("keydown", preventKeyboardScroll);
}
