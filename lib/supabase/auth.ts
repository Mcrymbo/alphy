"use server"

import { cookies } from "next/headers"
import {
  createRouteHandlerClient,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"


export async function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createRouteHandlerClient({ cookies: () => cookieStore })
}

// Server Action (can set cookies)
export async function signIn(email: string, password: string) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) throw new Error(error.message)
  return { success: true }
}

// Read-only (can only get cookies)
export async function getCurrentUser() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function signOut() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) redirect("/admin/login")
  return user
}