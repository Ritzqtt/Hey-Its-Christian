function Resume() {
  return (
    <section id="resume" className="page-section alternate-section">
      <div className="section-container">
        <p className="section-label">MY BACKGROUND</p>
        <h2>Resume</h2>
        <div className="section-line" />

        <div className="resume-grid">
          <div className="resume-card">
            <h3>Education</h3>
            <h4>Rizal Technological University</h4>
            <p>College Student</p>
            <span>Present</span>
          </div>

          <div className="resume-card">
            <h3>Experience</h3>
            <h4>Academic Projects</h4>
            <p>
              Developing web-based applications and
              working with database management systems.
            </p>
          </div>

          <div className="resume-card">
            <h3>Career Objective</h3>
            <p>
              To continuously improve my programming skills
              and gain experience in software and web development.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Resume;