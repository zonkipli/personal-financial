// Database connection using Supabase
import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Generate UUID
export function generateUUID(): string {
  return crypto.randomUUID()
}

// Hash password using SHA-256
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "finance_app_salt_2024")
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// Format date for database (ISO 8601)
export function formatDateForDB(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

export default { supabase, generateUUID, hashPassword, verifyPassword, formatDateForDB }
