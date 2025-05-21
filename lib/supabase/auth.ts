"use server"

import { cookies } from "next/headers"
import {
  createRouteHandlerClient,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"

// For Server Components (read-only)
export async function getCurrentUser() {
  const supabase = createServerComponentClient({ cookies })
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

// For Route Handlers and Server Actions (read-write)
export async function signIn(email: string, password: string) {
  const supabase = createRouteHandlerClient({ cookies })
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('Sign in error:', error.message)
    throw new Error('Invalid login credentials')
  }
  
  return { success: true }
}

export async function signOut() {
  const supabase = createRouteHandlerClient({ cookies })
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error.message)
    throw new Error('Failed to sign out')
  }
  
  return { success: true }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/admin/login?message=Please sign in to access this page")
  }
  return user
}