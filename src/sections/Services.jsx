const services = [
  {
    number: "01",
    title: "Web Development",
    description:
      "Building responsive and user-friendly websites using modern web technologies.",
  },
  {
    number: "02",
    title: "Frontend Development",
    description:
      "Creating clean and interactive user interfaces using HTML, CSS, JavaScript, and React.",
  },
  {
    number: "03",
    title: "Database Management",
    description:
      "Designing database structures and managing information using relational databases.",
  },
];

function Services() {
  return (
    <section id="services" className="page-section alternate-section">
      <div className="section-container">
        <p className="section-label">WHAT I CAN DO</p>
        <h2>Services</h2>
        <div className="section-line" />

        <p className="section-intro">
          Areas of development I'm currently focusing on
          and continuously improving.
        </p>

        <div className="services-grid">
          {services.map((service) => (
            <div className="service-card" key={service.number}>
              <span className="service-number">
                {service.number}
              </span>

              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;