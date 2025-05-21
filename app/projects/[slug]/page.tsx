import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Github, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getProjectBySlug, getProjects } from "@/lib/supabase/projects"

export const dynamic = 'force-dynamic';

type Params = {
  slug: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const resolvedParams = await params
  const project = await getProjectBySlug(resolvedParams.slug)

  if (!project) {
    return {
      title: "Project Not Found",
    }
  }

  return {
    title: `${project.title} | Alphonce Mcrymbo`,
    description: project.description,
  }
}

export async function generateStaticParams() {
  const projects = await getProjects()

  return projects.map((project) => ({
    slug: project.slug,
  }))
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>
}) {
  const resolvedParams = await params
  const project = await getProjectBySlug(resolvedParams.slug)

  if (!project) {
    notFound()
  }

  let imagePath: string | null = null;

  try {
    // Handle if image is already a URL string
    if (typeof project.image === "string") {
      // Try to parse if it's a JSON string
      if (project.image.startsWith("{")) {
        const parsed = JSON.parse(project.image);
        imagePath = parsed?.url ?? null;
      } else {
        imagePath = project.image;
      }
    }

    // Handle if it's a plain object
    if (
      typeof project.image === "object" &&
      project.image !== null &&
      typeof project.image.url === "string"
    ) {
      imagePath = project.image.url;
    }
  } catch (err) {
    console.warn("Failed to parse image:", err);
  }

  return (
    <main className="container mx-auto px-4 md:px-6 py-12">
      <Link href="/projects">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft size={16} /> Back to Projects
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
            {imagePath &&<Image src={imagePath} alt={project.title} fill className="object-cover" />}
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-4">{project.title}</h1>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.technologies.map((tech, index) => (
              <Badge key={tech} variant={index % 2 === 0 ? "secondary" : "outline"}>
                {tech}
              </Badge>
            ))}
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg">{project.description}</p>
            {project.content.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-6 sticky top-20">
            <h3 className="text-xl font-medium mb-4">Project Details</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p>{project.date}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p>{project.role}</p>
              </div>

              <div className="pt-4 space-y-3">
                {project.liveUrl && (
                  <Button asChild className="w-full gap-2">
                    <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <Globe size={16} /> View Live Site
                    </Link>
                  </Button>
                )}

                {project.githubUrl && (
                  <Button asChild variant="outline" className="w-full gap-2">
                    <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github size={16} /> View Source Code
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
