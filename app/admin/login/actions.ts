"use server";

import { signIn } from "@/lib/supabase/auth";

/**
 * Runs on the server (edge / node) because of `"use server"`.
 * It can safely set cookies through signIn().
 */
export async function loginAction(email: string, password: string) {
  await signIn(email, password);   // will throw if creds are wrong
}
