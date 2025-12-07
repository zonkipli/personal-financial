// Database connection - MySQL dengan fallback ke localStorage
// Untuk v0 preview, menggunakan localStorage. Untuk production dengan MySQL,
// set MYSQL_HOST environment variable

import mysql from "mysql2/promise"

// MySQL Configuration
const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || "vendory.my.id",
  user: process.env.MYSQL_USER || "digital1_financial_app",
  password: process.env.MYSQL_PASSWORD || "digital1_financial_app",
  database: process.env.MYSQL_DATABASE || "digital1_financial_app",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 10000,
}

// Create MySQL pool
let pool: mysql.Pool | null = null

function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(MYSQL_CONFIG)
  }
  return pool
}

// Query function untuk MySQL
export async function query<T>(sql: string, params?: unknown[]): Promise<T> {
  try {
    const connection = getPool()
    const [results] = await connection.execute(sql, params)
    return results as T
  } catch (error) {
    console.error("[v0] MySQL Query Error:", error)
    throw error
  }
}

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

// Format date for MySQL (YYYY-MM-DD HH:MM:SS)
export function formatDateForMySQL(date: Date = new Date()): string {
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

export default { query, generateUUID, hashPassword, verifyPassword, formatDateForMySQL }
