import Link from "next/link"
import { ArrowRight, Code, FileText, Github, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import HeroSection from "@/components/hero-section"
import ProjectsShowcase from "@/components/projects-showcase"
import SkillsSection from "@/components/skills-section"
import ContactSection from "@/components/contact-section"

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />

      <section id="about" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tight mb-8">About Me</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <p className="text-lg mb-4">
                I&apos;m Alphonce Mcrymbo, a passionate Full Stack Developer with 3 years of active development experience. I
                specialize in building robust web applications using modern technologies.
              </p>
              <p className="text-lg mb-6">
                My expertise spans both frontend and backend development, allowing me to create seamless, end-to-end
                solutions for complex problems.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/projects">
                  <Button className="gap-2">
                    View Projects <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link href="/resume">
                  <Button variant="outline" className="gap-2">
                    Resume <FileText size={16} />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm">
                  <Code size={32} className="mb-2 text-primary" />
                  <h3 className="font-medium">Frontend</h3>
                  <p className="text-center text-sm text-muted-foreground">React, Next.js, Tailwind</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm">
                  <Github size={32} className="mb-2 text-primary" />
                  <h3 className="font-medium">Backend</h3>
                  <p className="text-center text-sm text-muted-foreground">Django, Flask, Node.js</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm">
                  <Mail size={32} className="mb-2 text-primary" />
                  <h3 className="font-medium">Communication</h3>
                  <p className="text-center text-sm text-muted-foreground">Clear & Effective</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm">
                  <FileText size={32} className="mb-2 text-primary" />
                  <h3 className="font-medium">Documentation</h3>
                  <p className="text-center text-sm text-muted-foreground">Detailed & Thorough</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SkillsSection />
      <ProjectsShowcase />
      <ContactSection />
    </main>
  )
}
