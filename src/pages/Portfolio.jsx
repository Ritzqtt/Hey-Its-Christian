import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  finishPageTransition,
  startPageTransitionEntrance,
} from "../utils/pageTransition";

import Navbar from "../components/Navbar";

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

    // Wait for the section to be laid out before scrolling.
    const frame = requestAnimationFrame(() => {
      const section = document.getElementById(id);

      if (!section) return;

      const navbar = document.querySelector(".navbar");
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const top =
        section.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({
        top: Math.max(top, 0),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });

    return () => {
      cancelAnimationFrame(frame);
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
    </div>
  );
}

export default Portfolio;
