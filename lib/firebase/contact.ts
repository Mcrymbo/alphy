"use server"

import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import { db } from "./config"
import type { ContactMessage } from "@/lib/types"

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export async function submitContactForm(formData: ContactFormData): Promise<void> {
  try {
    const contactRef = collection(db, "messages")
    await addDoc(contactRef, {
      ...formData,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Error submitting contact form:", error)
    throw new Error("Failed to submit contact form. Please try again later.")
  }
}

export async function getMessages(): Promise<ContactMessage[]> {
  try {
    const messagesRef = collection(db, "messages")
    const q = query(messagesRef, orderBy("timestamp", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ContactMessage[]
  } catch (error) {
    console.error("Error getting messages:", error)
    // Return empty array instead of throwing
    return []
  }
}

export async function deleteMessage(id: string): Promise<void> {
  try {
    const messageRef = doc(db, "messages", id)
    await deleteDoc(messageRef)
  } catch (error) {
    console.error("Error deleting message:", error)
    throw new Error("Failed to delete message. Please check your Firebase permissions.")
  }
}
