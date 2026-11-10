import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const projects = [
  {
    title: "EnovAcc",
    category: "Web-Based Accounting System",
    description:
      "A web-based accounting system designed to manage financial transactions, bank reconciliation, payroll summaries, and tax computations.",
    technologies: ["React.js", "JavaScript", "HTML","CSS","Node.js", "Express.js", "Supabase", "PostgreSQL"],
    status: "In Development",
    github: "",
    liveUrl: "",
  },
  {
    title: "CJFoodieSarap",
    category: "Business Website",
    description:
      "A responsive catering website for a Taguig-based party food business, with an interactive tray menu that builds an order and sends it to Messenger, plus packages, bilao sets, an inquiry form, and an embedded map.",
    technologies: ["React", "Vite", "Tailwind CSS", "JavaScript", "Google Maps Embed"],
    status: "Completed",
    github: "https://github.com/Ritzqtt/CJFoodieSarap",
    liveUrl: "https://cjfoodiesarap.vercel.app/",
  },
];

const CLOSE_DURATION = 200;

const VIEWPORTS = [
  { id: "desktop", label: "Web", width: 1280 },
  { id: "tablet", label: "Tablet", width: 768 },
  { id: "mobile", label: "Mobile", width: 390 },
];

function statusClass(status) {
  return status === "Completed"
    ? "project-status project-status--completed"
    : "project-status";
}

function ProjectModal({ project, onClosed }) {
  const [isClosing, setIsClosing] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [viewportId, setViewportId] = useState("desktop");
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const closeButtonRef = useRef(null);
  const previouslyFocused = useRef(null);
  const frameRef = useRef(null);

  const requestClose = useCallback(() => {
    setIsClosing(true);
    window.setTimeout(onClosed, CLOSE_DURATION);
  }, [onClosed]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [requestClose]);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      previouslyFocused.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return undefined;

    const update = () =>
      setFrameSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [project.liveUrl]);

  const viewport = VIEWPORTS.find((item) => item.id === viewportId);
  const scale = frameSize.width
    ? Math.min(1, frameSize.width / viewport.width)
    : 1;
  const iframeStyle = {
    width: viewport.width,
    height: frameSize.height / scale,
    left: Math.max(0, (frameSize.width - viewport.width * scale) / 2),
    transform: `scale(${scale})`,
  };

  return createPortal(
    <div
      className={`project-modal-backdrop${isClosing ? " is-closing" : ""}`}
      onClick={requestClose}
    >
      <div
        className="project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="project-modal-close"
          aria-label="Close project details"
          onClick={requestClose}
        >
          ×
        </button>

        <div className="project-modal-preview">
          {project.liveUrl ? (
            <>
              <div className="project-modal-toolbar">
                <span className="project-modal-toolbar-label">
                  Preview
                </span>
                <div
                  className="viewport-toggle"
                  role="group"
                  aria-label="Preview size"
                >
                  {VIEWPORTS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={viewportId === item.id}
                      onClick={() => setViewportId(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="project-modal-frame" ref={frameRef}>
                {!previewLoaded && (
                  <p className="project-modal-loading">Loading preview…</p>
                )}
                {frameSize.width > 0 && (
                  <iframe
                    src={project.liveUrl}
                    title={`${project.title} website preview`}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    referrerPolicy="no-referrer"
                    style={iframeStyle}
                    onLoad={() => setPreviewLoaded(true)}
                  />
                )}
              </div>

              <p className="project-modal-fallback">
                Preview not loading?{" "}
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open the live site in a new tab ↗
                </a>
              </p>
            </>
          ) : (
            <div className="project-modal-empty">
              <p>No live preview available for this project yet.</p>
            </div>
          )}
        </div>

        <div className="project-modal-info">
          <span className="project-category">{project.category}</span>
          <h3 id="project-modal-title">{project.title}</h3>
          <p className="project-modal-description">{project.description}</p>

          <div className="project-modal-section">
            <h4>Technologies</h4>
            <div className="project-technologies">
              {project.technologies.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
          </div>

          <div className="project-modal-section">
            <h4>Status</h4>
            <span className={statusClass(project.status)}>
              {project.status}
            </span>
          </div>

          {project.github && (
            <div className="project-modal-section">
              <h4>GitHub Repository</h4>
              <a
                className="project-modal-repo"
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                {project.github.replace(/^https?:\/\//, "")} ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);

  const handleCardKeyDown = (event, project) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedProject(project);
    }
  };

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
            <article
              className="project-card"
              key={project.title}
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              aria-label={`View details for ${project.title}`}
              onClick={() => setSelectedProject(project)}
              onKeyDown={(event) => handleCardKeyDown(event, project)}
            >
              <div className="project-top">
                <span className="project-category">
                  {project.category}
                </span>

                <span className={statusClass(project.status)}>
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
            </article>
          ))}
        </div>
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClosed={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
}

export default Projects;