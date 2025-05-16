import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProjectCard from "@/components/project-card"
import { getProjects } from "@/lib/firebase/projects"

export default async function ProjectsShowcase() {
  const projects = await getProjects()
  const featuredProjects = projects.slice(0, 3)

  return (
    <section id="projects" className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Featured Projects</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Here are some of my recent projects. Each project demonstrates different skills and technologies.
            </p>
          </div>
          <Link href="/projects">
            <Button variant="outline" className="gap-2">
              View All Projects <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
