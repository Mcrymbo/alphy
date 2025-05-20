"use server"

import { createServerSupabaseClient } from "./auth"
import type { ContactMessage } from "@/lib/types"

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export async function submitContactForm(formData: ContactFormData): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("messages").insert({
      ...formData,
      timestamp: new Date().toISOString(),
    })

    if (error) {
      console.error("Error submitting contact form:", error)
      throw error
    }
  } catch (error) {
    console.error("Error submitting contact form:", error)
    throw new Error("Failed to submit contact form. Please try again later.")
  }
}

export async function getMessages(): Promise<ContactMessage[]> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.from("messages").select("*").order("timestamp", { ascending: false })

    if (error) {
      console.error("Error getting messages:", error)
      throw error
    }

    return (data || []) as ContactMessage[]
  } catch (error) {
    console.error("Error getting messages:", error)
    // Return empty array instead of throwing
    return []
  }
}

export async function deleteMessage(id: string): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("messages").delete().eq("id", id)

    if (error) {
      console.error("Error deleting message:", error)
      throw error
    }
  } catch (error) {
    console.error("Error deleting message:", error)
    throw new Error("Failed to delete message. Please check your Supabase permissions.")
  }
}
