"use server"

import { requireAuth} from "./auth"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { ContactMessage } from "@/lib/types"

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

// Create a database client with proper cookie handling
function createDbClient() {
  const cookieStore = cookies()
  return createRouteHandlerClient({ cookies: () => cookieStore })
}

export async function submitContactForm(formData: ContactFormData): Promise<{ success: boolean }> {
  try {
    const supabase = createDbClient()

    const { error } = await supabase.from("messages").insert({
      ...formData,
      timestamp: new Date().toISOString(),
      read: false // Add read status flag
    })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error submitting contact form:", error)
    throw new Error("Failed to submit contact form. Please try again later.")
  }
}

export async function getMessages(): Promise<ContactMessage[]> {
  try {
    // Require authentication for accessing messages
    await requireAuth()
    const supabase = createDbClient()

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("timestamp", { ascending: false })

    if (error) throw error

    return (data || []) as ContactMessage[]
  } catch (error) {
    console.error("Error getting messages:", error)
    return []
  }
}

export async function markAsRead(id: string): Promise<void> {
  try {
    await requireAuth()
    const supabase = createDbClient()

    const { error } = await supabase
      .from("messages")
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Error marking message as read:", error)
    throw new Error("Failed to update message status.")
  }
}

export async function deleteMessage(id: string): Promise<void> {
  try {
    await requireAuth()
    const supabase = createDbClient()

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting message:", error)
    throw new Error("Failed to delete message. Please try again.")
  }
}