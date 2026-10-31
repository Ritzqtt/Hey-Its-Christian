const projects = [
  {
    title: "EnovAcc",
    category: "Web-Based Accounting System",
    description:
      "A web-based accounting system designed to manage financial transactions, bank reconciliation, payroll summaries, and tax computations.",
    technologies: ["React.js", "JavaScript", "HTML","CSS","Node.js", "Express.js", "Supabase", "PostgreSQL"],
    github: "",
    status: "In Development",
  },
];

function Projects() {
  return (
    <section id="projects" className="page-section">
      <div className="section-container">
        <p className="section-label">MY RECENT WORK</p>
        <h2>Projects</h2>
        <div className="section-line" />

        <p className="section-intro">
          A collection of my academic and personal projects
          where I apply my knowledge and continuously
          improve my development skills.
        </p>

        <div className="projects-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.title}>
              <div className="project-top">
                <span className="project-category">
                  {project.category}
                </span>

                <span className="project-status">
                  {project.status}
                </span>
              </div>

              <h3>{project.title}</h3>

              <p className="project-description">
                {project.description}
              </p>

              <div className="project-technologies">
                {project.technologies.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>

              {project.github && (
                <a
                  className="project-link"
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub ↗
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;