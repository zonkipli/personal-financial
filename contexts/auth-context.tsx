"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USER_STORAGE_KEY = "finance_app_user"

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(USER_STORAGE_KEY)
  return stored ? JSON.parse(stored) : null
}

function setStoredUser(user: User | null) {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_STORAGE_KEY)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = getStoredUser()
    setUser(storedUser)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!data.success) {
        return { success: false, error: data.error }
      }

      setStoredUser(data.user)
      setUser(data.user)
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Terjadi kesalahan koneksi" }
    }
  }

  const register = async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!data.success) {
        return { success: false, error: data.error }
      }

      setStoredUser(data.user)
      setUser(data.user)
      return { success: true }
    } catch (error) {
      console.error("Register error:", error)
      return { success: false, error: "Terjadi kesalahan koneksi" }
    }
  }

  const logout = () => {
    setStoredUser(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
