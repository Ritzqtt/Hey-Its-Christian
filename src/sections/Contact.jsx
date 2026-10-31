function Contact() {
  return (
    <section id="contact" className="page-section alternate-section">
      <div className="section-container">
        <p className="section-label">LET'S CONNECT</p>
        <h2>Contact Me</h2>
        <div className="section-line" />

        <p className="section-intro">
          Have a project idea, collaboration opportunity,
          or just want to connect? Feel free to reach out!
        </p>

        <div className="contact-details">
          <a href="mailto:your-email@example.com">
            your-email@example.com
          </a>

          <a
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Profile ↗
          </a>
        </div>
      </div>
    </section>
  );
}

export default Contact;