import type { Metadata } from "next"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/admin/dashboard"
import { getCurrentUser } from "@/lib/supabase/auth"

export const metadata: Metadata = {
  title: "Admin Dashboard | Alphonce Mcrymbo",
  description: "Admin dashboard for managing portfolio content.",
}

export default async function AdminPage() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect("/admin/login")
    }

    return <AdminDashboard />
  } catch (error) {
    console.error("Error in admin page:", error)
    redirect("/admin/login")
  }
}
