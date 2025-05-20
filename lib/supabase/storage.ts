"use server"

import { createServerSupabaseClient } from "./auth"

export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    const supabase = await createServerSupabaseClient()

    // Extract bucket and filename from path
    const [bucket, ...pathParts] = path.split("/")
    const filename = pathParts.join("/")

    const { data, error } = await supabase.storage.from(bucket).upload(filename, file, {
      upsert: true,
      contentType: file.type,
    })

    if (error) {
      console.error("Error uploading image:", error)
      throw error
    }

    // Get public URL
    const { data: urlData } = await supabase.storage.from(bucket).getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }
}

export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    const supabase = await createServerSupabaseClient()

    // Extract bucket and filename from path
    const [bucket, ...pathParts] = path.split("/")
    const filename = pathParts.join("/")

    const { data, error } = await supabase.storage.from(bucket).upload(filename, file, {
      upsert: true,
      contentType: file.type,
    })

    if (error) {
      console.error("Error uploading file:", error)
      throw error
    }

    // Get public URL
    const { data: urlData } = await supabase.storage.from(bucket).getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error("Error uploading file:", error)
    throw new Error("Failed to upload file")
  }
}
