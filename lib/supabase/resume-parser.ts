"use server"

import { PDFDocument } from 'pdf-lib'
import { getDocument } from 'pdfjs-dist'
import { ResumeData } from "@/lib/types"

// If the ResumeData type requires non-null values, we'll define our internal type
interface InternalResumeData {
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
    website?: string;
  };
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const HIGH_ACCURACY_MODEL = "anthropic/claude-3-opus"

export async function parseResumeFromBuffer(buffer: Buffer): Promise<ResumeData> {
  try {
    // Try PDF.js first for better layout handling
    let pdfText = await extractWithPDFjs(buffer)
    if (!pdfText || pdfText.trim().length < 50) {
      // Fallback to pdf-lib if extraction seems incomplete
      pdfText = await extractWithPDFLib(buffer)
    }

    // If we still don't have reasonable text, throw an error
    if (!pdfText || pdfText.trim().length < 50) {
      throw new Error("Could not extract text from PDF")
    }

    return await parseWithAI(pdfText)
  } catch (error) {
    console.error("Resume parsing failed:", error)
    throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function extractWithPDFjs(buffer: Buffer): Promise<string> {
  try {
    // Ensure PDF.js is properly initialized
    const loadingTask = getDocument({ data: buffer })
    const pdf = await loadingTask.promise
    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      fullText += textContent.items.map(item => 'str' in item ? item.str : '').join(' ') + '\n'
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
        // Access the low-level page dictionary node
        const contents = page.node.Contents()

        if (!contents) continue

        // Contents can be an array or a single object, normalize it to an array
        const contentsArray = Array.isArray(contents) ? contents : [contents]

        for (const content of contentsArray) {
          // content is a PDFRawStream or PDFStream
          const decoded = content.getContents?.() ?? content.getUncompressedContents?.()

          if (decoded) {
            // decoded is a Uint8Array
            fullText += new TextDecoder().decode(decoded) + '\n'
          }
        }
      } catch (pageErr) {
        console.warn("Skipping page due to error:", pageErr)
      }
    }

    // The content will be raw PDF operators and text, noisy but fallback text
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
      email: string | null;
      phone: string | null;
      location: string | null;
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
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    
    // Verify the response has the expected structure
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from AI service")
    }

    // Safely parse the JSON response
    let parsedData
    try {
      parsedData = JSON.parse(data.choices[0].message.content)
    } catch (error) {
      console.error("Failed to parse AI response:", error)
      throw new Error("AI returned invalid JSON")
    }

    return validateResumeData(parsedData)
  } catch (error) {
    console.error("AI parsing failed:", error)
    throw new Error(`Failed to parse resume with AI: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function validateResumeData(data): ResumeData {
  // Create a valid structure with default values
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
      title: typeof exp.title === 'string' ? exp.title : '',
      company: typeof exp.company === 'string' ? exp.company : '',
      period: typeof exp.period === 'string' ? exp.period : '',
      responsibilities: Array.isArray(exp.responsibilities) 
        ? exp.responsibilities.filter((r) => typeof r === 'string')
        : []
    }))
  }

  // Education validation
  if (data.education && Array.isArray(data.education)) {
    validatedData.education = data.education.map((edu) => ({
      degree: typeof edu.degree === 'string' ? edu.degree : '',
      institution: typeof edu.institution === 'string' ? edu.institution : '',
      period: typeof edu.period === 'string' ? edu.period : '',
      description: typeof edu.description === 'string' ? edu.description : ''
    }))
  }

  // Skills validation
  if (data.skills && typeof data.skills === 'object') {
    // Technical skills
    if (Array.isArray(data.skills.Technical)) {
      validatedData.skills.Technical = data.skills.Technical.filter((s) => typeof s === 'string')
    }
    
    // Soft skills
    if (Array.isArray(data.skills.Soft)) {
      validatedData.skills.Soft = data.skills.Soft.filter((s) => typeof s === 'string')
    }
    
    // Tools
    if (Array.isArray(data.skills.Tools)) {
      validatedData.skills.Tools = data.skills.Tools.filter((s) => typeof s === 'string')
    }
  }

  // Languages validation
  if (data.languages && Array.isArray(data.languages)) {
    validatedData.languages = data.languages.map((lang) => ({
      language: typeof lang.language === 'string' ? lang.language : '',
      proficiency: typeof lang.proficiency === 'string' ? lang.proficiency : ''
    }))
  }

  // Contact validation
  if (data.contact && typeof data.contact === 'object') {
    validatedData.contact = {
      email: typeof data.contact.email === 'string' ? data.contact.email : '',
      phone: typeof data.contact.phone === 'string' ? data.contact.phone : '',
      location: typeof data.contact.location === 'string' ? data.contact.location : '',
      website: typeof data.contact.website === 'string' ? data.contact.website : undefined
    }
  }

  return validatedData as ResumeData;
}