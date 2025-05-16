"use server"

import { doc, getDoc, setDoc } from "firebase/firestore"
import { getDownloadURL, ref } from "firebase/storage"
import { db, storage } from "./config"
import type { ResumeData } from "@/lib/types"

const RESUME_DOC_ID = "main"

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
    location: "Tanzania",
    website: "https://alphoncemcrymbo.com",
  },
}

export async function getResumeData(): Promise<ResumeData> {
  try {
    const resumeRef = doc(db, "resume", RESUME_DOC_ID)
    const resumeSnap = await getDoc(resumeRef)

    if (resumeSnap.exists()) {
      return resumeSnap.data() as ResumeData
    } else {
      console.log("No resume document found, using default data")
      return defaultResumeData
    }
  } catch (error) {
    console.error("Error getting resume data:", error)
    console.log("Using default resume data due to error")
    // Return default data instead of throwing an error
    return defaultResumeData
  }
}

export async function updateResumeData(resumeData: ResumeData): Promise<void> {
  try {
    const resumeRef = doc(db, "resume", RESUME_DOC_ID)
    await setDoc(resumeRef, resumeData)
  } catch (error) {
    console.error("Error updating resume data:", error)
    throw new Error("Failed to update resume data. Please check your Firebase permissions.")
  }
}

export async function getResumeFileUrl(): Promise<string> {
  try {
    const resumeRef = ref(storage, "resume/cv.pdf")
    return await getDownloadURL(resumeRef)
  } catch (error) {
    console.error("Error getting resume file URL:", error)
    return "#" // Return a placeholder URL if the file doesn't exist or there's a permission error
  }
}
