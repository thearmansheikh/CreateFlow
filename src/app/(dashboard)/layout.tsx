import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import type { Database } from "@/types/database"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]

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

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, credits_balance")
    .eq("id", user.id)
    .single() as { data: UserProfile | null }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        userName={profile?.full_name || user.email?.split("@")[0]}
        creditsBalance={profile?.credits_balance ?? 0}
      />
      <main className="flex min-h-screen flex-1 overflow-auto">{children}</main>
    </div>
  )
}
