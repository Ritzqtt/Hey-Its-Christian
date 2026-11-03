const skillCategories = [
  {
    title: "PROGRAMMING LANGUAGES",
    skills: ["C++", "CSS3", "HTML5", "Java", "JavaScript", "PHP", "Python", "SQL", "TypeScript"],
  },
  {
    title: "LIBRARIES & FRAMEWORKS",
    skills: ["Bootstrap", "Express.js", "Next.js", "Node.js", "React.js", "Resend", "Tailwind CSS"],
  },
  {
    title: "DATABASE",
    skills: ["MariaDB", "Microsoft SQL Server", "MongoDB", "MySQL", "PostgreSQL", "Supabase"],
  },
  {
    title: "TOOLS",
    skills: ["Docker", "Git", "GitHub", "npm", "Visual Studio Code", "Vite", "XAMPP"],
  },
  {
    title: "DESIGN & PRODUCTIVITY TOOLS",
    skills: ["Canva", "Figma", "Google Workspace", "Lucid", "Microsoft Suite"],
  },
  {
    title: "SOFT SKILLS",
    skills: [
      "Adaptability",
      "Analytical Thinking",
      "Attention to Detail",
      "Communication",
      "Problem Solving",
      "Teamwork",
      "Time Management",
    ],
  },
  {
    title: "TECHNICAL SUPPORT",
    skills: [
      "Computer Troubleshooting",
      "LAN/Wi-Fi Configuration",
      "Network Troubleshooting",
      "System Maintenance",
      "Technical Documentation",
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
          Technologies, tools, and strengths I bring to my development work.
        </p>

        <div className="skills-list">
          {skillCategories.map((category) => (
            <div className="skill-category" key={category.number}>
              <div className="skill-category-label">
                <span className="skill-category-number">{category.number}</span>
                <h3>{category.title}</h3>
              </div>

              <ul className="skill-items">
                {category.skills.map((skill) => (
                  <li className="skill-item" key={skill}>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
