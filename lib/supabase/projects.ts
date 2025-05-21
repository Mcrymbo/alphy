"use server"

import { requireAuth } from "./auth"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Project } from "@/lib/types"

// Sample projects data to use as fallback
const sampleProjects: Omit<Project, "id">[] = [
  {
    title: "E-commerce Platform",
    slug: "e-commerce-platform",
    description: "A full-featured e-commerce platform with product management, cart, and checkout functionality.",
    content:
      "This project is a comprehensive e-commerce solution built with Next.js and Supabase. It includes features like product catalog, shopping cart, user authentication, and payment processing with Stripe.\n\nThe frontend is built with React and styled with Tailwind CSS, providing a responsive and intuitive user interface. The backend uses Supabase for data storage, authentication, and serverless functions.",
    image: "/placeholder.svg?height=600&width=800",
    technologies: ["Next.js", "React", "Supabase", "Tailwind CSS", "Stripe"],
    date: "2023-04-15",
    role: "Full Stack Developer",
    liveUrl: "https://example.com/ecommerce",
    githubUrl: "https://github.com/example/ecommerce",
  },
  {
    title: "Task Management App",
    slug: "task-management-app",
    description: "A collaborative task management application with real-time updates and team features.",
    content:
      "The Task Management App is designed to help teams organize and track their work efficiently. Built with React for the frontend and Django for the backend, it provides a robust platform for task creation, assignment, and tracking.\n\nKey features include real-time updates using WebSockets, team collaboration tools, file attachments, and detailed reporting dashboards. The app also includes a notification system to keep team members informed about task updates.",
    image: "/placeholder.svg?height=600&width=800",
    technologies: ["React", "Django", "PostgreSQL", "WebSockets", "Docker"],
    date: "2022-11-20",
    role: "Backend Developer",
    liveUrl: "https://example.com/taskapp",
    githubUrl: "https://github.com/example/taskapp",
  },
  {
    title: "Portfolio Website",
    slug: "portfolio-website",
    description: "A personal portfolio website showcasing projects and skills with a modern design.",
    content:
      "This portfolio website was built using Next.js and Tailwind CSS to showcase my projects and skills. It features a clean, responsive design with dark mode support and smooth animations.\n\nThe site includes sections for projects, skills, resume, and contact information. It's optimized for performance and SEO, achieving high scores on Lighthouse audits.",
    image: "/placeholder.svg?height=600&width=800",
    technologies: ["Next.js", "Tailwind CSS", "Supabase", "Framer Motion"],
    date: "2023-01-10",
    role: "Full Stack Developer",
    liveUrl: "https://example.com/portfolio",
    githubUrl: "https://github.com/example/portfolio",
  },
]

// Helper function to create Supabase client for database operations
function createDbClient() {
  const cookieStore = cookies()
  return createRouteHandlerClient({ cookies: () => cookieStore })
}

export async function getProjects(): Promise<Project[]> {
  try {
    const supabase = createDbClient()
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("date", { ascending: false })

    if (error) throw error

    return data?.length ? (data as Project[]) : getSampleProjects()
  } catch (error) {
    console.error("Error getting projects:", error)
    return getSampleProjects()
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const supabase = createDbClient()
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .single()

    if (error?.code === "PGRST116") {
      return getSampleProjectBySlug(slug)
    }
    if (error) throw error

    return data as Project
  } catch (error) {
    console.error("Error getting project:", error)
    return getSampleProjectBySlug(slug)
  }
}

export async function addProject(projectData: Omit<Project, "id">): Promise<string> {
  // Require authentication for write operations
  await requireAuth()

  try {
    const supabase = createDbClient()
    const { data, error } = await supabase
      .from("projects")
      .insert(projectData)
      .select()
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error("Error adding project:", error)
    throw new Error("Failed to add project. Please try again.")
  }
}

export async function deleteProject(id: string): Promise<void> {
  // Require authentication for delete operations
  await requireAuth()

  if (id.startsWith("sample-")) {
    throw new Error("Cannot delete sample projects")
  }

  try {
    const supabase = createDbClient()
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting project:", error)
    throw new Error("Failed to delete project. Please try again.")
  }
}

// Helper functions for sample data
function getSampleProjects(): Project[] {
  return sampleProjects.map((project, index) => ({
    id: `sample-${index}`,
    ...project,
  }))
}

function getSampleProjectBySlug(slug: string): Project | null {
  const project = sampleProjects.find(p => p.slug === slug)
  return project ? { id: `sample-${slug}`, ...project } : null
}