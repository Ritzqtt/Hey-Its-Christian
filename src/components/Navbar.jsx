const navLinks = [
  { name: "Home", id: "home" },
  { name: "About", id: "about" },
  { name: "Resume", id: "resume" },
  { name: "Skills", id: "skills" },
  { name: "Services", id: "services" },
  { name: "Projects", id: "projects" },
  { name: "Contact", id: "contact" },
];

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <a href="#home" className="navbar-logo">
          Christian Barcoma
        </a>

        <nav className="navbar-links">
          {navLinks.map((link) => (
            <a key={link.id} href={`#${link.id}`}>
              <span>&gt;</span> {link.name}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;