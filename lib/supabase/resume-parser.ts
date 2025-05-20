"use server"

import { PDFDocument } from 'pdf-lib'
import { getDocument } from 'pdfjs-dist'
import { ResumeData } from "@/lib/types"

// Type definitions for PDF.js text content
declare module 'pdfjs-dist' {
  interface TextItem {
    str: string;
    transform: number[];
    // Add other properties if needed
  }
  interface TextContent {
    items: TextItem[];
  }
}

interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  responsibilities: string[];
}

interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  description: string;
}

interface Skills extends Record<string, string[]> {
  Technical: string[];
  Soft: string[];
  Tools: string[];
}

interface LanguageItem {
  language: string;
  proficiency: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  website?: string;
}

interface InternalResumeData {
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: Skills;
  languages: LanguageItem[];
  contact: ContactInfo;
}

interface RawExperienceItem {
  title?: string;
  company?: string;
  period?: string;
  responsibilities?: string[];
}

interface RawEducationItem {
  degree?: string;
  institution?: string;
  period?: string;
  description?: string;
}

interface RawSkills extends Record<string, string[] | undefined> {
  Technical?: string[];
  Soft?: string[];
  Tools?: string[];
}

interface RawLanguageItem {
  language?: string;
  proficiency?: string;
}

interface RawContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
}

interface RawResumeData {
  experience?: RawExperienceItem[];
  education?: RawEducationItem[];
  skills?: RawSkills;
  languages?: RawLanguageItem[];
  contact?: RawContactInfo;
}

interface AIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: string;
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const HIGH_ACCURACY_MODEL = "anthropic/claude-3-opus"

export async function parseResumeFromBuffer(buffer: Buffer): Promise<ResumeData> {
  try {
    let pdfText = await extractWithPDFjs(buffer)
    if (!pdfText || pdfText.trim().length < 50) {
      pdfText = await extractWithPDFLib(buffer)
    }

    if (!pdfText || pdfText.trim().length < 50) {
      throw new Error("Could not extract text from PDF")
    }

    return await parseWithAI(pdfText)
  } catch (error) {
    console.error("Resume parsing failed:", error)
    throw new Error(
      `Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

async function extractWithPDFjs(buffer: Buffer): Promise<string> {
  try {
    const loadingTask = getDocument({ data: buffer })
    const pdf = await loadingTask.promise
    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      fullText += textContent.items
        .map((item) => 'str' in item ? item.str : '')
        .join(' ') + '\n'
    }
    
    return fullText
  } catch (error) {
    console.error("PDF.js extraction failed:", error)
    return ""
  }
}

async function extractWithPDFLib(buffer: Buffer): Promise<string> {
  try {
    const pdfDoc = await PDFDocument.load(buffer)
    const pages = pdfDoc.getPages()
    let fullText = ''

    for (const page of pages) {
      try {
        const contents = page.node.Contents()
        if (!contents) continue

        const contentsArray = Array.isArray(contents) ? contents : [contents]

        for (const content of contentsArray) {
          const decoded = content.getContents?.() ?? content.getUncompressedContents?.()
          if (decoded) {
            fullText += new TextDecoder().decode(decoded) + '\n'
          }
        }
      } catch (pageErr) {
        console.warn("Skipping page due to error:", pageErr)
      }
    }

    return fullText.replace(/\s+/g, ' ').trim()
  } catch (error) {
    console.error("PDF-lib extraction failed:", error)
    return ""
  }
}

async function parseWithAI(pdfText: string): Promise<ResumeData> {
  const SYSTEM_PROMPT = `Extract resume information with high accuracy. Return JSON matching this structure:
  {
    experience: Array<{
      title: string;
      company: string;
      period: string;
      responsibilities: string[];
    }>;
    education: Array<{
      degree: string;
      institution: string;
      period: string;
      description: string;
    }>;
    skills: {
      Technical: string[];
      Soft: string[];
      Tools: string[];
    };
    languages: Array<{
      language: string;
      proficiency: string;
    }>;
    contact: {
      email: string;
      phone: string;
      location: string;
      website: string | null;
    };
  }`

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "",
        "X-Title": process.env.NEXT_PUBLIC_APP_NAME || "Resume Parser"
      },
      body: JSON.stringify({
        model: HIGH_ACCURACY_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: pdfText }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as { error?: string }))
      throw new Error(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`)
    }

    const data: AIResponse = await response.json()
    
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from AI service")
    }

    let parsedData: RawResumeData
    try {
      parsedData = JSON.parse(data.choices[0].message.content) as RawResumeData
    } catch (error) {
      console.error("Failed to parse AI response:", error)
      throw new Error("AI returned invalid JSON")
    }

    return validateResumeData(parsedData)
  } catch (error) {
    console.error("AI parsing failed:", error)
    throw new Error(
      `Failed to parse resume with AI: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

function validateResumeData(data: RawResumeData): ResumeData {
  const validatedData: InternalResumeData = {
    experience: [],
    education: [],
    skills: {
      Technical: [],
      Soft: [],
      Tools: []
    },
    languages: [],
    contact: {
      email: '',
      phone: '',
      location: '',
      website: ''
    }
  }

  // Experience validation
  if (data.experience && Array.isArray(data.experience)) {
    validatedData.experience = data.experience.map((exp) => ({
      title: exp.title || '',
      company: exp.company || '',
      period: exp.period || '',
      responsibilities: Array.isArray(exp.responsibilities) 
        ? exp.responsibilities.filter((r): r is string => typeof r === 'string')
        : []
    }))
  }

  // Education validation
  if (data.education && Array.isArray(data.education)) {
    validatedData.education = data.education.map((edu) => ({
      degree: edu.degree || '',
      institution: edu.institution || '',
      period: edu.period || '',
      description: edu.description || ''
    }))
  }

  // Skills validation
  if (data.skills) {
    if (Array.isArray(data.skills.Technical)) {
      validatedData.skills.Technical = data.skills.Technical.filter((s): s is string => typeof s === 'string')
    }
    
    if (Array.isArray(data.skills.Soft)) {
      validatedData.skills.Soft = data.skills.Soft.filter((s): s is string => typeof s === 'string')
    }
    
    if (Array.isArray(data.skills.Tools)) {
      validatedData.skills.Tools = data.skills.Tools.filter((s): s is string => typeof s === 'string')
    }
  }

  // Languages validation
  if (data.languages && Array.isArray(data.languages)) {
    validatedData.languages = data.languages.map((lang) => ({
      language: lang.language || '',
      proficiency: lang.proficiency || ''
    }))
  }

  // Contact validation
  if (data.contact) {
    validatedData.contact = {
      email: data.contact.email || '',
      phone: data.contact.phone || '',
      location: data.contact.location || '',
      website: data.contact.website || undefined
    }
  }

  return validatedData;
}