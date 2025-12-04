"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { usePrivacy } from "@/contexts/privacy-context"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  PiggyBank,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  HandCoins,
  Eye,
  EyeOff,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transaksi", href: "/dashboard/transactions", icon: ArrowLeftRight },
  { name: "Kategori", href: "/dashboard/categories", icon: Tags },
  { name: "Anggaran", href: "/dashboard/budget", icon: PiggyBank },
  { name: "Utang Piutang", href: "/dashboard/debts", icon: HandCoins },
  { name: "Laporan", href: "/dashboard/reports", icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { isAmountHidden, toggleAmountVisibility } = usePrivacy()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Privacy toggle button for mobile */}
      <Button
        variant="outline"
        size="icon"
        className="fixed right-4 top-4 z-50 md:hidden bg-transparent"
        onClick={toggleAmountVisibility}
      >
        {isAmountHidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className={cn("flex h-16 items-center justify-between border-b px-4", isCollapsed && "justify-center")}>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            {!isCollapsed && <span className="font-semibold">FinanceApp</span>}
          </Link>
          {/* Privacy toggle button in header for desktop */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={toggleAmountVisibility}
              title={isAmountHidden ? "Tampilkan nilai" : "Sembunyikan nilai"}
            >
              {isAmountHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && "justify-center px-2",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Privacy toggle for collapsed sidebar */}
        {isCollapsed && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-full"
              onClick={toggleAmountVisibility}
              title={isAmountHidden ? "Tampilkan nilai" : "Sembunyikan nilai"}
            >
              {isAmountHidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>
        )}

        {/* User section */}
        <div className="border-t p-2">
          {!isCollapsed && user && (
            <div className="mb-2 rounded-lg bg-accent/50 px-3 py-2">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            className={cn("w-full justify-start gap-3 text-muted-foreground", isCollapsed && "justify-center px-2")}
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Keluar</span>}
          </Button>
        </div>

        {/* Collapse button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 hidden h-6 w-6 rounded-full border bg-background md:flex"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
        </Button>
      </aside>
    </>
  )
}
