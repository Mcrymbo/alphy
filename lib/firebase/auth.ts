"use server"

import { cookies } from "next/headers"
import { signInWithEmailAndPassword, getIdToken } from "firebase/auth"
import { auth } from "./config"

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const token = await getIdToken(userCredential.user)

    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Error signing in:", error)
    throw new Error("Authentication failed")
  }
}

export async function signOut() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("auth-token")

    return { success: true }
  } catch (error) {
    console.error("Error signing out:", error)
    throw new Error("Sign out failed")
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token: string | undefined = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    // In a real app, verify the token with Firebase Admin SDK
    return {
      id: "admin",
      email: "admin@example.com",
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
