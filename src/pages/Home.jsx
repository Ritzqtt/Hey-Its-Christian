import { useEffect } from "react";
import { Link } from "react-router-dom";
import facebookIcon from "../assets/icons/facebook.png";
import instagramIcon from "../assets/icons/instagram.png";
import xIcon from "../assets/icons/x.png";
import tiktokIcon from "../assets/icons/tiktok.png";
import githubIcon from "../assets/icons/github.png";

const socialLinks = [
  { name: "Facebook", icon: facebookIcon, url: "https://www.facebook.com/christian.olbes.18" },
  { name: "Instagram", icon: instagramIcon, url: "https://www.instagram.com/ritzqt_/" },
  { name: "X", icon: xIcon, url: "https://x.com/kwiishii" },
  { name: "TikTok", icon: tiktokIcon, url: "https://www.tiktok.com/@ritzqtt" },
  { name: "GitHub", icon: githubIcon, url: "https://github.com/Ritzqtt" },
];

const navLinks = [
  { name: "About", to: "/portfolio#about" },
  { name: "Resume", to: "/portfolio#resume" },
  { name: "Skills", to: "/portfolio#skills" },
  { name: "Projects", to: "/portfolio#projects" },
  { name: "Contact", to: "/portfolio#contact" },
];

function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              className={link.name === "Home" ? "active" : ""}
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
