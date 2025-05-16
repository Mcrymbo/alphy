import type { Metadata } from "next"
import Link from "next/link"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getResumeData, getResumeFileUrl } from "@/lib/firebase/resume"

export const metadata: Metadata = {
  title: "Resume | Alphonce Mcrymbo",
  description: "Professional resume of Alphonce Mcrymbo, a Full Stack Developer with 3 years of experience.",
}

export default async function ResumePage() {
  const resumeData = await getResumeData()
  const resumeFileUrl = await getResumeFileUrl()

  return (
    <main className="container px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Resume</h1>
          <p className="text-lg text-muted-foreground mt-2">My professional experience, skills, and education</p>
        </div>

        <Button asChild className="gap-2">
          <Link href={resumeFileUrl} target="_blank" rel="noopener noreferrer">
            <Download size={16} /> Download PDF
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-6">Work Experience</h2>
            <div className="space-y-6">
              {resumeData.experience.map((job, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-2">
                      <h3 className="text-xl font-medium">{job.title}</h3>
                      <span className="text-muted-foreground">{job.period}</span>
                    </div>
                    <p className="text-primary font-medium mb-4">{job.company}</p>
                    <ul className="list-disc pl-5 space-y-2">
                      {job.responsibilities.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Education</h2>
            <div className="space-y-6">
              {resumeData.education.map((edu, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-2">
                      <h3 className="text-xl font-medium">{edu.degree}</h3>
                      <span className="text-muted-foreground">{edu.period}</span>
                    </div>
                    <p className="text-primary font-medium mb-2">{edu.institution}</p>
                    <p>{edu.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Skills</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {Object.entries(resumeData.skills).map(([category, skills]) => (
                      <div key={category}>
                        <h3 className="font-medium mb-2">{category}</h3>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <span
                              key={skill}
                              className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Languages</h2>
              <Card>
                <CardContent className="p-6">
                  <ul className="space-y-2">
                    {resumeData.languages.map((lang) => (
                      <li key={lang.language} className="flex justify-between">
                        <span>{lang.language}</span>
                        <span className="text-muted-foreground">{lang.proficiency}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Contact</h2>
              <Card>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {Object.entries(resumeData.contact).map(([key, value]) => (
                      <li key={key} className="flex flex-col">
                        <span className="text-sm text-muted-foreground capitalize">{key}</span>
                        <span>{value}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
