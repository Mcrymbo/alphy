"use server"

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

type UploadOptions = {
  upsert?: boolean
  contentType?: string
  cacheControl?: string
}

type StorageResult = {
  url: string
  path: string
  bucket: string
}

// Create a storage client with proper cookie handling
function createStorageClient() {
  const cookieStore = cookies()
  return createRouteHandlerClient({ cookies: () => cookieStore }).storage
}

/**
 * Uploads a file to Supabase Storage and returns its public URL
 * @param file The file to upload
 * @param path Full storage path including bucket (e.g., "avatars/user-123/profile.jpg")
 * @param options Upload options
 * @returns StorageResult with URL, path, and bucket
 */
export async function uploadFile(
  file: File | Blob,
  path: string,
  options: UploadOptions = {}
): Promise<StorageResult> {
  try {
    const storage = createStorageClient()
    const [bucket, ...pathParts] = path.split("/")
    const filePath = pathParts.join("/")

    // Set default options
    const uploadOptions = {
      upsert: true,
      contentType: file.type,
      cacheControl: '3600',
      ...options
    }

    const { data, error } = await storage
      .from(bucket)
      .upload(filePath, file, uploadOptions)

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      url: publicUrl,
      path: data.path,
      bucket
    }
  } catch (error) {
    console.error(`Error uploading file to ${path}:`, error)
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Uploads an image file with additional validation
 * @param file The image file to upload
 * @param path Full storage path including bucket
 * @param options Upload options
 * @returns StorageResult with URL, path, and bucket
 */
export async function uploadImage(
  file: File,
  path: string,
  options: UploadOptions = {}
): Promise<StorageResult> {
  // Basic image type validation
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed')
  }

  // Set image-specific defaults
  const imageOptions = {
    contentType: file.type,
    cacheControl: '86400', // Longer cache for images
    ...options
  }

  return uploadFile(file, path, imageOptions)
}

/**
 * Deletes a file from storage
 * @param path Full storage path including bucket
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const storage = createStorageClient()
    const [bucket, ...pathParts] = path.split("/")
    const filePath = pathParts.join("/")

    const { error } = await storage
      .from(bucket)
      .remove([filePath])

    if (error) throw error
  } catch (error) {
    console.error(`Error deleting file ${path}:`, error)
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Gets a public URL for a stored file
 * @param path Full storage path including bucket
 * @returns Public URL string
 */
export async function getFileUrl(path: string): Promise<string> {
  try {
    const storage = createStorageClient()
    const [bucket, ...pathParts] = path.split("/")
    const filePath = pathParts.join("/")

    const { data: { publicUrl } } = await storage
      .from(bucket)
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error(`Error getting URL for ${path}:`, error)
    throw new Error(`Failed to get file URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}