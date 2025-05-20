"use server"

import { createServerSupabaseClient } from "./auth"
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

export async function getProjects(): Promise<Project[]> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.from("projects").select("*").order("date", { ascending: false })

    if (error) {
      console.error("Error getting projects:", error)
      throw error
    }

    if (!data || data.length === 0) {
      console.log("No projects found in Supabase, using sample data")
      return sampleProjects.map((project, index) => ({
        id: `sample-${index}`,
        ...project,
      }))
    }

    return data as Project[]
  } catch (error) {
    console.error("Error getting projects:", error)
    console.log("Using sample projects data due to error")
    // Return sample data instead of an empty array
    return sampleProjects.map((project, index) => ({
      id: `sample-${index}`,
      ...project,
    }))
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).single()

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned - try to find in sample data
        const sampleProject = sampleProjects.find((p) => p.slug === slug)
        if (sampleProject) {
          return {
            id: `sample-${slug}`,
            ...sampleProject,
          }
        }
        return null
      }

      console.error("Error getting project by slug:", error)
      throw error
    }

    return data as Project
  } catch (error) {
    console.error("Error getting project by slug:", error)
    // Try to find the project in sample data
    const sampleProject = sampleProjects.find((p) => p.slug === slug)
    if (sampleProject) {
      return {
        id: `sample-${slug}`,
        ...sampleProject,
      }
    }
    return null
  }
}

export async function addProject(projectData: Omit<Project, "id">): Promise<string> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.from("projects").insert(projectData).select().single()

    if (error) {
      console.error("Error adding project:", error)
      throw error
    }

    return data.id
  } catch (error) {
    console.error("Error adding project:", error)
    throw new Error("Failed to add project. Please check your Supabase permissions.")
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    // Don't attempt to delete sample projects
    if (id.startsWith("sample-")) {
      throw new Error("Cannot delete sample projects")
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("projects").delete().eq("id", id)

    if (error) {
      console.error("Error deleting project:", error)
      throw error
    }
  } catch (error) {
    console.error("Error deleting project:", error)
    throw new Error("Failed to delete project. Please check your Supabase permissions.")
  }
}
