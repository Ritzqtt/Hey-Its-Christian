import { useEffect, useRef, useState } from "react";
import useTimelineFill from "../hooks/useTimelineFill";

const experiences = [
  {
    id: "visible-technologies",
    title: "Full-Stack Developer (Internship)",
    company: "Visible Technologies International Corp.",
    dates: "January 2026 – March 2026",
    address: "G/F Ridgewood Square, C-5 Avenue, Brgy. Ususan, Taguig, 1632",
    responsibilities:
      "Developed a CRM system using React.js and Node.js, recreated the company's official webpage using a custom design built with React.js, and configured the CRM on a server to allow remote user access. Collaborated with the development team using Git for version control and participated in testing, debugging, and implementing new features.",
  },
  {
    id: "enov8tive-technologies",
    title: "Frontend Developer (Internship)",
    company: "Enov8tive Technologies Solutions Inc.",
    dates: "September 2026 – October 2026",
    address:
      "10F Unit C, Robinsons Cyber Sigma, Lawton Ave, McKinley West, Taguig, Metro Manila",
    responsibilities:
      "Developed several features of the company's system using React.js, translated the system interface from English into French, and performed daily quality assurance (QA) testing to ensure system functionality. Collaborated with the backend development team using Git.",
  },
];

function Experience() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const timelineRef = useRef(null);
  const experienceMarkerRefs = useRef({});
  const educationTimelineRef = useRef(null);
  const educationMarkerRefs = useRef({});
  const closeButtonRef = useRef(null);
  const locationTriggerRefs = useRef({});

  useTimelineFill(timelineRef, experienceMarkerRefs);
  useTimelineFill(educationTimelineRef, educationMarkerRefs, true);

  useEffect(() => {
    if (!selectedLocation) return undefined;

    const previousOverflow = document.body.style.overflow;
    const trigger = locationTriggerRefs.current[selectedLocation.id];

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedLocation(null);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      trigger?.focus();
    };
  }, [selectedLocation]);

  return (
    <section id="experience" className="page-section alternate-section">
      <div className="section-container">
        <p className="section-label">MY BACKGROUND</p>
        <h2>Experience</h2>
        <div className="section-line" />

        <div className="experience-content">
          <section className="experience-block" aria-labelledby="work-experience">
            <h3 className="experience-subtitle" id="work-experience">
              Experience
            </h3>

            <ol className="experience-timeline" ref={timelineRef}>
              {experiences.map((experience) => (
                <li className="experience-entry" key={experience.title}>
                  <span
                    ref={(element) => {
                      experienceMarkerRefs.current[experience.id] = element;
                    }}
                    className="experience-marker"
                    aria-hidden="true"
                  />
                  <article className="experience-entry-content">
                    <p className="experience-dates">{experience.dates}</p>
                    <h4>{experience.title}</h4>
                    <button
                      ref={(element) => {
                        locationTriggerRefs.current[experience.id] = element;
                      }}
                      type="button"
                      className="experience-company-trigger"
                      aria-label={`View location for ${experience.company}`}
                      onClick={() => setSelectedLocation(experience)}
                    >
                      {experience.company}
                    </button>

                    <p className="experience-responsibilities">
                      {experience.responsibilities}
                    </p>
                  </article>
                </li>
              ))}
            </ol>
          </section>

          <section className="education-block" aria-labelledby="education">
            <h3 className="experience-subtitle" id="education">
              Education
            </h3>

            <div className="education-entry" ref={educationTimelineRef}>
              <span
                ref={(element) => {
                  educationMarkerRefs.current.education = element;
                }}
                className="education-marker"
                aria-hidden="true"
              />
              <p className="experience-dates">2023 – Present</p>
              <h4>Rizal Technological University – Boni Campus</h4>
              <p className="education-location">Boni Avenue, Mandaluyong</p>
              <p>Bachelor of Science in Information Technology</p>
              <p className="education-graduation">Expected Graduation: 2027</p>
            </div>
          </section>
        </div>
      </div>

      {selectedLocation && (
        <div
          className="location-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedLocation(null);
            }
          }}
        >
          <section
            className="location-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-modal-title"
          >
            <header className="location-modal-header">
              <span className="location-modal-pin" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="10"
                    r="2.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              </span>
              <h3 id="location-modal-title">{selectedLocation.company}</h3>
              <button
                ref={closeButtonRef}
                type="button"
                className="location-modal-close"
                aria-label="Close location map"
                onClick={() => setSelectedLocation(null)}
              >
                ×
              </button>
            </header>

            <iframe
              className="location-modal-map"
              title={`Map showing ${selectedLocation.company}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(selectedLocation.address)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <footer className="location-modal-footer">
              <a
                className="experience-map-link"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLocation.address)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Google Maps
              </a>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}

export default Experience;