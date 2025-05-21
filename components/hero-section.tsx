import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Download, Github, Linkedin, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getResumeFileUrl } from "@/lib/supabase/resume"

export default async function HeroSection() {
  const resumeFileUrl = await getResumeFileUrl()
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Delivering <span className="text-primary">Scalable, Impactful Solutions.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl">
              I build intuitive frontends and robust backends that drive business growth and create seamless user experiences.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/projects">
                <Button size="lg" className="gap-2">
                  View My Work <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href={resumeFileUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="gap-2">
                  Download CV <Download size={16} />
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <a
                href="https://github.com/mcrymbo/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-secondary p-2 rounded-full hover:bg-secondary/80 transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://linkedin.com/in/mcrymbo"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-secondary p-2 rounded-full hover:bg-secondary/80 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:amcrymbo@gmail.com"
                className="bg-secondary p-2 rounded-full hover:bg-secondary/80 transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-primary/20">
              <Image
                src="/alphy.png?height=320&width=320"
                alt="Alphonce Mcrymbo"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/10 rounded-full"></div>
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-primary/20 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
