import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContactSection() {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Let's Work Together</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Have a project in mind or want to discuss potential opportunities? I'm always open to new challenges and
            collaborations.
          </p>
          <Link href="/contact">
            <Button size="lg" className="gap-2">
              Get in Touch <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
