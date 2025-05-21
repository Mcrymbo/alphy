export interface ImageObject {
  url: string;
}

export interface Project {
    id: string
    title: string
    slug: string
    description: string
    content: string
    image: string | ImageObject;
    technologies: string[]
    date: string
    role: string
    liveUrl?: string
    githubUrl?: string
  }
  
  export interface ResumeData {
    experience: {
      title: string
      company: string
      period: string
      responsibilities: string[]
    }[]
    education: {
      degree: string
      institution: string
      period: string
      description: string
    }[]
    skills: Record<string, string[]>
    languages: {
      language: string
      proficiency: string
    }[]
    contact: {
      email: string
      phone: string
      location: string
      website?: string
    }
  }
  
  export interface ContactMessage {
    id: string
    name: string
    email: string
    subject: string
    message: string
    timestamp: number
  }
  