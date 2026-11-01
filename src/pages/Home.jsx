import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import usePageTransition from "../hooks/usePageTransition";
import { startPageTransitionEntrance } from "../utils/pageTransition";
import facebookIcon from "../assets/icons/facebook.png";
import instagramIcon from "../assets/icons/instagram.png";
import xIcon from "../assets/icons/x.png";
import tiktokIcon from "../assets/icons/tiktok.png";
import githubIcon from "../assets/icons/github.png";
import linkedinIcon from "../assets/icons/linkedin.png";

const socialLinks = [
  { name: "Facebook", icon: facebookIcon, url: "https://www.facebook.com/christian.olbes.18" },
  { name: "Instagram", icon: instagramIcon, url: "https://www.instagram.com/ritzqt_/" },
  { name: "X", icon: xIcon, url: "https://x.com/kwiishii" },
  { name: "TikTok", icon: tiktokIcon, url: "https://www.tiktok.com/@ritzqtt" },
  { name: "GitHub", icon: githubIcon, url: "https://github.com/Ritzqtt" },
  { name: "LinkedIn", icon: linkedinIcon, url: "https://www.linkedin.com/in/cobarcoma" },
];

const navLinks = [
  { name: "About", to: "/portfolio#about" },
  { name: "Projects", to: "/portfolio#projects" },
  { name: "Skills", to: "/portfolio#skills" },
  { name: "Experience", to: "/portfolio#experience" },
  { name: "Contact", to: "/portfolio#contact" },
];

function Home() {
  const location = useLocation();
  const goToPage = usePageTransition();

  useEffect(() => {
    window.scrollTo(0, 0);

    const transitionId = location.state?.pageTransitionId;
    if (transitionId) {
      startPageTransitionEntrance(
        document.querySelector(".home-content"),
        transitionId,
        0
      );
    }
  }, [location.key, location.state]);

  return (
    <section id="home" className="home-page">
      <div className="home-content">
        <h1>Christian Barcoma</h1>

        <p className="home-subtitle">
          A <span>Senior</span> Student from Rizal Technological University
        </p>

        <nav className="home-navigation">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              onClick={(event) => goToPage(event, link.to)}
            >
              &gt; {link.name}
            </Link>
          ))}
        </nav>

        <div className="social-links">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
            >
              <img src={social.icon} alt="" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Home;
