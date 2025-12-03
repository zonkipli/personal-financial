"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/types"
import { getStoredUser, setStoredUser, generateId, initializeDefaultCategories } from "@/lib/storage"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = getStoredUser()
    setUser(storedUser)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // For demo purposes, accept any email/password with basic validation
    if (!email || !password) {
      return { success: false, error: "Email dan password harus diisi" }
    }

    if (password.length < 6) {
      return { success: false, error: "Password minimal 6 karakter" }
    }

    const storedUser = getStoredUser()
    if (storedUser && storedUser.email === email) {
      setUser(storedUser)
      return { success: true }
    }

    // Create new user if not exists
    const newUser: User = {
      id: generateId("user"),
      email,
      name: email.split("@")[0],
      createdAt: new Date().toISOString(),
    }

    setStoredUser(newUser)
    initializeDefaultCategories(newUser.id)
    setUser(newUser)
    return { success: true }
  }

  const register = async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (!email || !password || !name) {
      return { success: false, error: "Semua field harus diisi" }
    }

    if (password.length < 6) {
      return { success: false, error: "Password minimal 6 karakter" }
    }

    const newUser: User = {
      id: generateId("user"),
      email,
      name,
      createdAt: new Date().toISOString(),
    }

    setStoredUser(newUser)
    initializeDefaultCategories(newUser.id)
    setUser(newUser)
    return { success: true }
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
