import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/sign-in")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

function Sidebar() {
  const links = [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Library", href: "/dashboard/library", icon: "📁" },
    { label: "Create", href: "/dashboard/create", icon: "✨" },
    { label: "Calendar", href: "/dashboard/calendar", icon: "📅" },
    { label: "Analytics", href: "/dashboard/analytics", icon: "📈" },
    { label: "Brands", href: "/dashboard/brands", icon: "🎨" },
    { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
  ]

  return (
    <aside className="hidden w-64 border-r border-border/50 bg-card/50 lg:block">
      <div className="flex h-16 items-center border-b border-border/50 px-6">
        <span className="text-xl font-bold">CreateFlow</span>
      </div>
      <nav className="space-y-1 p-4">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <span>{link.icon}</span>
            {link.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}
