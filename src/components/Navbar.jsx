import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import usePageTransition from "../hooks/usePageTransition";

const navLinks = [
  { name: "About", to: "/portfolio#about" },
  { name: "Projects", to: "/portfolio#projects" },
  { name: "Skills", to: "/portfolio#skills" },
  { name: "Experience", to: "/portfolio#experience" },
  { name: "Contact", to: "/portfolio#contact" },
];

const sectionIds = navLinks
  .filter((link) => link.to.includes("#"))
  .map((link) => link.to.split("#")[1]);

function ScrollProgress() {
  const barRef = useRef(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const frameRef = useRef(null);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const render = (value) => {
      if (barRef.current) {
        barRef.current.style.width = `${value}%`;
      }
    };

    const getTarget = () => {
      const scrollTop =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;

      if (scrollable <= 0) return 0;

      return Math.min(
        100,
        Math.max(0, (scrollTop / scrollable) * 100)
      );
    };

    // Smoothly ease the bar toward the target and stop when it arrives.
    const animate = () => {
      const target = targetRef.current;
      const current = currentRef.current;
      const difference = target - current;

      if (Math.abs(difference) < 0.1) {
        currentRef.current = target;
        render(target);
        frameRef.current = null;
        return;
      }

      currentRef.current = current + difference * 0.18;
      render(currentRef.current);
      frameRef.current = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    const handleScroll = () => {
      targetRef.current = getTarget();

      if (reduceMotionRef.current) {
        currentRef.current = targetRef.current;
        render(currentRef.current);
        return;
      }

      startAnimation();
    };

    targetRef.current = getTarget();

    if (reduceMotionRef.current) {
      currentRef.current = targetRef.current;
      render(currentRef.current);
    } else {
      startAnimation();
    }

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    window.addEventListener("resize", handleScroll);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={barRef} className="scroll-progress-bar" />
    </div>
  );
}

function Navbar() {
  const [activeSection, setActiveSection] = useState("about");
  const [menuOpen, setMenuOpen] = useState(false);
  const goToPage = usePageTransition(() => setMenuOpen(false));

  useEffect(() => {
    const root = document.documentElement;
    let lastY = window.scrollY;
    let timer;

    const onScroll = () => {
      const y = window.scrollY;

      if (y !== lastY) {
        root.dataset.scroll = y > lastY ? "down" : "up";
        lastY = y;
      }

      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        delete root.dataset.scroll;
      }, 700);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
      delete root.dataset.scroll;
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-45% 0px -50% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link
          to="/"
          className="navbar-logo"
          onClick={(event) => goToPage(event, "/")}
        >
          Christian Barcoma
        </Link>

        <button
          type="button"
          className="navbar-toggle"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav
          id="primary-navigation"
          className={`navbar-links${menuOpen ? " is-open" : ""}`}
          aria-label="Primary navigation"
        >
          {navLinks.map((link) => {
            const id = link.to.includes("#")
              ? link.to.split("#")[1]
              : null;

            return (
              <Link
                key={link.name}
                to={link.to}
                className={id === activeSection ? "active" : ""}
                onClick={(event) => goToPage(event, link.to)}
              >
                <span>&gt;</span> {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <ScrollProgress />
    </header>
  );
}

export default Navbar;
