"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Resolver } from "react-hook-form"
import { z } from "zod"
import { Plus, Save, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { getResumeData, updateResumeData } from "@/lib/firebase/resume"
import { uploadFile } from "@/lib/firebase/storage"

const formSchema = z.object({
  experience: z.array(
    z.object({
      title: z.string().min(2),
      company: z.string().min(2),
      period: z.string().min(2),
      responsibilities: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string().min(2),
      institution: z.string().min(2),
      period: z.string().min(2),
      description: z.string(),
    }),
  ),
  skills: z.record(z.array(z.string())),
  languages: z.array(
    z.object({
      language: z.string().min(2),
      proficiency: z.string().min(2),
    }),
  ),
  contact: z.object({
    email: z.string().email(),
    phone: z.string(),
    location: z.string(),
    website: z.string().url().optional().or(z.literal("")),
  }),
})

export default function ResumeManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: async () => {
      try {
        const resumeData = await getResumeData()
        return resumeData
      } catch (error) {
        toast.error('',{
          description: "Failed to load resume data.",
        })
        return {
          experience: [{ title: "", company: "", period: "", responsibilities: [] }],
          education: [{ degree: "", institution: "", period: "", description: "" }],
          skills: { Frontend: [], Backend: [], Other: [] },
          languages: [{ language: "", proficiency: "" }],
          contact: { email: "", phone: "", location: "", website: "" },
        }
      }
    },
  })

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      toast.info("Invalid file",{
        description: "Please upload a PDF file.",
      })
      return
    }

    setResumeFile(file)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    try {
      // Update resume data
      await updateResumeData(values)

      // Upload resume file if provided
      if (resumeFile) {
        await uploadFile(resumeFile, "resume/cv.pdf")
      }

      toast.success('',{
        description: "Resume updated successfully.",
      })

      router.refresh()
    } catch (error) {
      toast.error('',{
        description: "Failed to update resume. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resume</h2>

        <div className="flex gap-2">
          <label
            htmlFor="resume-file"
            className="flex items-center gap-2 cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md"
          >
            <Upload size={16} />
            {resumeFile ? resumeFile.name : "Upload PDF"}
            <input id="resume-file" type="file" accept=".pdf" className="hidden" onChange={handleResumeFileChange} />
          </label>

          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading} className="gap-2">
            <Save size={16} /> {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-8">
          {/* Experience Section */}
          <Card>
            <CardHeader>
              <CardTitle>Experience</CardTitle>
            </CardHeader>
            <CardContent>
              {form.watch("experience").map((_, index) => (
                <div key={index} className="space-y-4 mb-8 pb-8 border-b last:border-0 last:mb-0 last:pb-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`experience.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Senior Developer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experience.${index}.company`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Company Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`experience.${index}.period`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Period</FormLabel>
                        <FormControl>
                          <Input placeholder="Jan 2020 - Present" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`experience.${index}.responsibilities`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsibilities</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter responsibilities (one per line)"
                            className="min-h-[100px]"
                            value={Array.isArray(field.value) ? field.value.join("\n") : field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {index > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const experiences = form.getValues("experience")
                        form.setValue(
                          "experience",
                          experiences.filter((_, i) => i !== index),
                        )
                      }}
                    >
                      Remove Experience
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full mt-4 gap-2"
                onClick={() => {
                  const experiences = form.getValues("experience")
                  form.setValue("experience", [
                    ...experiences,
                    { title: "", company: "", period: "", responsibilities: [] },
                  ])
                }}
              >
                <Plus size={16} /> Add Experience
              </Button>
            </CardContent>
          </Card>

          {/* Education Section */}
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              {form.watch("education").map((_, index) => (
                <div key={index} className="space-y-4 mb-8 pb-8 border-b last:border-0 last:mb-0 last:pb-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`education.${index}.degree`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Degree</FormLabel>
                          <FormControl>
                            <Input placeholder="Bachelor of Science in Computer Science" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`education.${index}.institution`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution</FormLabel>
                          <FormControl>
                            <Input placeholder="University Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`education.${index}.period`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Period</FormLabel>
                        <FormControl>
                          <Input placeholder="2015 - 2019" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`education.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of your education"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {index > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const educations = form.getValues("education")
                        form.setValue(
                          "education",
                          educations.filter((_, i) => i !== index),
                        )
                      }}
                    >
                      Remove Education
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full mt-4 gap-2"
                onClick={() => {
                  const educations = form.getValues("education")
                  form.setValue("education", [
                    ...educations,
                    { degree: "", institution: "", period: "", description: "" },
                  ])
                }}
              >
                <Plus size={16} /> Add Education
              </Button>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contact.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+123 456 7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact.location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact.website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://yourwebsite.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}
