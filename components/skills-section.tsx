import { Code, Database, FileCode, Globe, Layout, Server, Terminal, Workflow } from "lucide-react"

const skills = [
  {
    category: "Frontend",
    icon: <Layout className="h-8 w-8 text-primary" />,
    items: ["React", "Next.js", "Tailwind CSS", "HTML5", "CSS3", "JavaScript"],
  },
  {
    category: "Backend",
    icon: <Server className="h-8 w-8 text-primary" />,
    items: ["Django", "Flask", "Node.js", "Express", "RESTful APIs"],
  },
  {
    category: "Database",
    icon: <Database className="h-8 w-8 text-primary" />,
    items: ["PostgreSQL", "MySQL", "MongoDB", "Firebase"],
  },
  {
    category: "DevOps",
    icon: <Workflow className="h-8 w-8 text-primary" />,
    items: ["Git", "GitHub", "CI/CD", "Docker", "AWS"],
  },
  {
    category: "Languages",
    icon: <Code className="h-8 w-8 text-primary" />,
    items: ["Python", "JavaScript", "TypeScript", "HTML", "CSS"],
  },
  {
    category: "Tools",
    icon: <Terminal className="h-8 w-8 text-primary" />,
    items: ["VS Code", "Postman", "Figma", "Bash", "npm/yarn"],
  },
  {
    category: "Web",
    icon: <Globe className="h-8 w-8 text-primary" />,
    items: ["Responsive Design", "SEO", "Web Performance", "Accessibility"],
  },
  {
    category: "Other",
    icon: <FileCode className="h-8 w-8 text-primary" />,
    items: ["UI/UX", "Testing", "Agile", "Problem Solving"],
  },
]

export default function SkillsSection() {
  return (
    <section id="skills" className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">My Skills</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            I've developed a diverse set of skills throughout my career as a Full Stack Developer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skill, index) => (
            <div key={index} className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                {skill.icon}
                <h3 className="text-xl font-medium">{skill.category}</h3>
              </div>
              <ul className="space-y-2">
                {skill.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
