import type { Metadata } from "next"
import { redirect } from "next/navigation"
import LoginForm from "@/components/admin/login-form"
import { getCurrentUser } from "@/lib/supabase/auth"

export const metadata: Metadata = {
  title: "Admin Login | Alphonce Mcrymbo",
  description: "Login to the admin dashboard.",
}

export default async function LoginPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/admin")
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Admin Login</h1>
        <LoginForm />
      </div>
    </div>
  )
}
