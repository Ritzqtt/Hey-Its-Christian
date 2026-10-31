const skillCategories = [
  {
    title: "Frontend Development",
    skills: [
      { name: "HTML5", level: "Intermediate" },
      { name: "CSS3", level: "Intermediate" },
      { name: "JavaScript", level: "Beginner" },
      { name: "React.js", level: "Beginner" },
    ],
  },
  {
    title: "Backend Development",
    skills: [
      { name: "Node.js", level: "Beginner" },
      { name: "Express.js", level: "Beginner" },
    ],
  },
  {
    title: "Database Management",
    skills: [
      { name: "MySQL", level: "Intermediate" },
      { name: "Database Design", level: "Intermediate" },
    ],
  },
  {
    title: "Tools & Technologies",
    skills: [
      { name: "Git", level: "Beginner" },
      { name: "GitHub", level: "Intermediate" },
      { name: "VS Code", level: "Intermediate" },
    ],
  },
];

function Skills() {
  return (
    <section id="skills" className="page-section">
      <div className="section-container">
        <p className="section-label">WHAT I WORK WITH</p>
        <h2>Skills</h2>
        <div className="section-line" />

        <p className="section-intro">
          These are the programming languages, technologies,
          and tools I have been learning and using throughout
          my development journey.
        </p>

        <div className="skills-grid">
          {skillCategories.map((category) => (
            <div className="skill-card" key={category.title}>
              <h3>{category.title}</h3>

              <div className="skill-list">
                {category.skills.map((skill) => (
                  <div className="skill-item" key={skill.name}>
                    <span>{skill.name}</span>
                    <span className="skill-level">
                      {skill.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;