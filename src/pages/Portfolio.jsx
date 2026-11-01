import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  finishPageTransition,
  startPageTransitionEntrance,
} from "../utils/pageTransition";

import Navbar from "../components/Navbar";
import FloatingBackToTop from "../components/FloatingBackToTop";

import About from "../sections/About";
import Projects from "../sections/Projects";
import Skills from "../sections/Skills";
import Experience from "../sections/Experience";
import Contact from "../sections/Contact";

function Portfolio() {
  const location = useLocation();

  useEffect(() => {
    const id = location.hash.replace("#", "");
    const transitionId = location.state?.pageTransitionId;

    if (transitionId && id) {
      const section = document.getElementById(id);
      const content = section?.querySelector(".section-container");

      if (!section || !content) {
        finishPageTransition();
        return undefined;
      }

      const navbarHeight =
        document.querySelector(".navbar")?.offsetHeight ?? 0;
      const targetTop =
        section.getBoundingClientRect().top + window.scrollY - navbarHeight;

      if (startPageTransitionEntrance(content, transitionId, targetTop)) {
        return undefined;
      }
    }

    if (!id) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const mobileTabletTarget =
      id !== "about" &&
      window.matchMedia("(max-width: 1024px)").matches;
    const scrollToSection = () => {
      const section = document.getElementById(id);

      if (!section) return;

      const navbar = document.querySelector(".navbar");
      const navbarHeight = navbar
        ? mobileTabletTarget
          ? navbar.getBoundingClientRect().height
          : navbar.offsetHeight
        : 0;
      const top =
        section.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({
        top: Math.max(top, 0),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    };

    // On compact layouts the drawer is still collapsing when the route changes.
    // Measure the fixed header only after its max-height transition has finished.
    const waitForMenuClose =
      mobileTabletTarget &&
      window.matchMedia("(max-width: 900px)").matches;
    let frame = null;
    let menuCloseTimer = null;

    if (waitForMenuClose) {
      menuCloseTimer = window.setTimeout(() => {
        frame = window.requestAnimationFrame(scrollToSection);
      }, 320);
    } else {
      frame = window.requestAnimationFrame(scrollToSection);
    }

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      if (menuCloseTimer !== null) window.clearTimeout(menuCloseTimer);
    };
  }, [location.pathname, location.hash, location.key, location.state]);

  return (
    <div className="portfolio-page">
      <Navbar />

      <main>
        <About />
        <Projects />
        <Skills />
        <Experience />
        <Contact />
      </main>

      <footer className="portfolio-footer">
        <p>© {new Date().getFullYear()} Christian Barcoma. All rights reserved.</p>
        <button
          type="button"
          className="back-to-top"
          aria-label="Back to top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "auto"
                : "smooth",
            })
          }
        >
          Back to Top ↑
        </button>
      </footer>
      <FloatingBackToTop />
    </div>
  );
}

export default Portfolio;
