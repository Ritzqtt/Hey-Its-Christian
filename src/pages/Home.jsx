const socialLinks = [
  { name: "Facebook", symbol: "f", url: "https://facebook.com/" },
  { name: "Instagram", symbol: "◎", url: "https://instagram.com/" },
  { name: "X", symbol: "𝕏", url: "https://x.com/" },
  { name: "TikTok", symbol: "♪", url: "https://tiktok.com/" },
  { name: "GitHub", symbol: "⌘", url: "https://github.com/" },
];

const navLinks = [
  { name: "Home", id: "home" },
  { name: "About", id: "about" },
  { name: "Resume", id: "resume" },
  { name: "Skills", id: "skills" },
  { name: "Services", id: "services" },
  { name: "Projects", id: "projects" },
  { name: "Contact", id: "contact" },
];

function Home() {
  return (
    <section id="home" className="home-page">
      <div className="home-content">
        <h1>Christian Barcoma</h1>

        <p className="home-subtitle">
          A <span>Junior</span> from Rizal Technological University
        </p>

        <nav className="home-navigation">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={link.id === "home" ? "active" : ""}
            >
              &gt; {link.name}
            </a>
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
              {social.symbol}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Home;