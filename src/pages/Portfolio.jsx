import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";

import About from "../sections/About";
import Projects from "../sections/Projects";
import Skills from "../sections/Skills";
import Resume from "../sections/Resume";
import Contact from "../sections/Contact";

function Portfolio() {
  const location = useLocation();

  useEffect(() => {
    const portfolio = document.querySelector(".portfolio-page");
    const sections = portfolio?.querySelectorAll(".page-section");

    if (
      !portfolio ||
      !sections?.length ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    portfolio.classList.add("portfolio-page--reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      portfolio.classList.remove("portfolio-page--reveal-ready");
      sections.forEach((section) => section.classList.remove("is-visible"));
    };
  }, []);

  useEffect(() => {
    const id = location.hash.replace("#", "");

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

      // Align the top of the section exactly under the fixed navbar.
      const top =
        section.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({
        top: Math.max(top, 0),
        behavior: "smooth",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash, location.key]);

  return (
    <div className="portfolio-page">
      <Navbar />

      <main>
        <About />
        <Projects />
        <Skills />
        <Resume />
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
