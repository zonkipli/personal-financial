"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface PrivacyContextType {
  isAmountHidden: boolean
  toggleAmountVisibility: () => void
  maskAmount: (formattedAmount: string) => string
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined)

const STORAGE_KEY = "finance_privacy_setting"

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [isAmountHidden, setIsAmountHidden] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setIsAmountHidden(JSON.parse(stored))
    }
  }, [])

  const toggleAmountVisibility = () => {
    setIsAmountHidden((prev) => {
      const newValue = !prev
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue))
      return newValue
    })
  }

  const maskAmount = (formattedAmount: string): string => {
    if (!isAmountHidden) return formattedAmount
    // Replace all digits with asterisks, keep currency symbol and separators
    return formattedAmount.replace(/\d/g, "*")
  }

  return (
    <PrivacyContext.Provider value={{ isAmountHidden, toggleAmountVisibility, maskAmount }}>
      {children}
    </PrivacyContext.Provider>
  )
}

export function usePrivacy() {
  const context = useContext(PrivacyContext)
  if (context === undefined) {
    throw new Error("usePrivacy must be used within a PrivacyProvider")
  }
  return context
}
