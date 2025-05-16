import type { Metadata } from "next"
import ProjectCard from "@/components/project-card"
import { getProjects } from "@/lib/firebase/projects"

export const metadata: Metadata = {
  title: "Projects | Alphonce Mcrymbo",
  description: "Explore the projects developed by Alphonce Mcrymbo, a Full Stack Developer.",
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <main className="container px-4 md:px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-6">My Projects</h1>
      <p className="text-lg text-muted-foreground mb-10 max-w-3xl">
        Here's a collection of projects I've worked on. Each project demonstrates different skills and technologies I've
        mastered throughout my career as a Full Stack Developer.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </main>
  )
}
