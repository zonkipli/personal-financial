import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { FinanceProvider } from "@/contexts/finance-context"
import { PrivacyProvider } from "@/contexts/privacy-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FinanceApp - Kelola Keuangan Pribadi",
  description: "Aplikasi pencatatan keuangan pribadi untuk mengelola pemasukan dan pengeluaran Anda",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <FinanceProvider>
            <PrivacyProvider>{children}</PrivacyProvider>
          </FinanceProvider>
        </AuthProvider>
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
