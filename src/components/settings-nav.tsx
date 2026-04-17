"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { User, CreditCard, Palette, Shield, Bell } from "lucide-react"

const settingsTabs = [
  { label: "Profile", href: "/dashboard/settings", icon: User },
  { label: "Billing", href: "/dashboard/settings/billing", icon: CreditCard },
  { label: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
  { label: "Security", href: "/dashboard/settings/security", icon: Shield },
]

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border/50 pb-0">
      {settingsTabs.map((tab) => {
        const isActive = pathname === tab.href || (!tab.href.endsWith("/settings") && pathname?.startsWith(tab.href))
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
              isActive
                ? "border-primary text-primary"
                : "text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
