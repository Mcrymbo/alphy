"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { signOut } from "@/lib/supabase/auth"
import ProjectsManager from "@/components/admin/projects-manager"
import ResumeManager from "@/components/admin/resume-manager"
import MessagesManager from "@/components/admin/messages-manager"

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setIsLoading(true)

    try {
      await signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unknown error occurred.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your portfolio content</p>
        </div>

        <Button variant="outline" onClick={handleSignOut} disabled={isLoading}>
          {isLoading ? "Signing out..." : "Sign Out"}
        </Button>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <ProjectsManager />
        </TabsContent>

        <TabsContent value="resume" className="space-y-4">
          <ResumeManager />
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <MessagesManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
