"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  FolderOpen,
  Sparkles,
  CalendarDays,
  BarChart3,
  Palette,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  CreditCard,
  RefreshCw,
} from "lucide-react"

interface SidebarProps {
  userName?: string
  creditsBalance?: number
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Library", href: "/dashboard/library", icon: FolderOpen },
  { label: "Create", href: "/dashboard/create", icon: Sparkles },
  { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Brands", href: "/dashboard/brands", icon: Palette },
  { label: "Repurpose", href: "/dashboard/repurpose", icon: RefreshCw },
  { label: "Credits", href: "/dashboard/credits", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar({ userName, creditsBalance }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed right-4 top-4 z-50 rounded-lg p-2 text-muted-foreground hover:bg-accent lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 border-r border-border/50 bg-card/80 backdrop-blur-xl transition-transform lg:static lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border/50 px-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            CreateFlow
          </Link>
        </div>

        {/* Nav */}
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Profile */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 p-4">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                {userName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 text-left">
                <p className="truncate font-medium">{userName || "User"}</p>
                <p className="text-xs text-muted-foreground">
                  {creditsBalance ?? 0} credits
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
                <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <Link href="/dashboard/settings/billing" className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                  <CreditCard className="h-4 w-4" />
                  Billing
                </Link>
                <button
                  onClick={async () => {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    window.location.href = "/auth/sign-in"
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-accent"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
