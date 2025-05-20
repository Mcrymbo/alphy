"use server"

import { createServerSupabaseClient } from "./auth"
import type { ResumeData } from "@/lib/types"

// Default resume data to use as fallback
const defaultResumeData: ResumeData = {
  experience: [
    {
      title: "Full Stack Developer",
      company: "Example Company",
      period: "2020 - Present",
      responsibilities: [
        "Developed and maintained web applications using React and Next.js",
        "Built backend APIs with Django and Flask",
        "Implemented responsive designs with Tailwind CSS",
      ],
    },
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "Example University",
      period: "2016 - 2020",
      description: "Graduated with honors. Focused on web development and software engineering.",
    },
  ],
  skills: {
    Frontend: ["React", "Next.js", "Tailwind CSS", "JavaScript", "TypeScript"],
    Backend: ["Django", "Flask", "Node.js", "Express"],
    Other: ["Git", "Docker", "AWS", "Agile"],
  },
  languages: [
    { language: "English", proficiency: "Fluent" },
    { language: "Swahili", proficiency: "Native" },
  ],
  contact: {
    email: "alphonce@example.com",
    phone: "+123 456 7890",
    location: "Nairobi - Kenya",
    website: "https://alphoncemcrymbo.com",
  },
}

export async function getResumeData(): Promise<ResumeData> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log("No authenticated user, returning default data")
      return defaultResumeData
    }

    const { data, error } = await supabase
      .from("resume")
      .select("data")
      .eq("user_id", user.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        console.log("No resume found for user, returning default data")
        return defaultResumeData
      }
      console.error("Error getting resume data:", error)
      throw error
    }

    return data.data as ResumeData
  } catch (error) {
    console.error("Error getting resume data:", error)
    return defaultResumeData
  }
}

export async function updateResumeData(resumeData: ResumeData): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Upsert resume data for the current user
    const { error } = await supabase
      .from("resume")
      .upsert({
        user_id: user.id,
        data: resumeData,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id)

    if (error) {
      console.error("Error updating resume data:", error)
      throw error
    }
  } catch (error) {
    console.error("Error updating resume data:", error)
    throw new Error("Failed to update resume data. Please try again.")
  }
}

export async function getResumeFileUrl(userId?: string): Promise<string> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // If no userId provided, get current user's ID
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return "#"
      userId = user.id
    }

    const { data } = await supabase
      .storage
      .from("resume")
      .getPublicUrl(`cv.pdf`)

    return data.publicUrl
  } catch (error) {
    console.error("Error getting resume file URL:", error)
    return "#"
  }
}