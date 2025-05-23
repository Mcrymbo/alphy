import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Project } from "@/lib/types"

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
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
    <Card className="overflow-hidden group">
      <div className="relative aspect-video overflow-hidden">
        {imagePath ? (
          <Image
            src={imagePath}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105 p-2"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {project.technologies.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
          {project.technologies.length > 3 && <Badge variant="outline">+{project.technologies.length - 3}</Badge>}
        </div>

        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>

        <p className="text-muted-foreground line-clamp-3">{project.description}</p>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link
          href={`/projects/${project.slug}`}
          className="text-sm font-medium text-primary flex items-center gap-1 hover:underline"
        >
          View Project <ArrowUpRight size={14} />
        </Link>
      </CardFooter>
    </Card>
  )
}
