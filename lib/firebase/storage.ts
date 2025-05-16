"use server"

import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "./config"

export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, await file.arrayBuffer())
    return await getDownloadURL(snapshot.ref)
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }
}

export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, await file.arrayBuffer())
    return await getDownloadURL(snapshot.ref)
  } catch (error) {
    console.error("Error uploading file:", error)
    throw new Error("Failed to upload file")
  }
}
