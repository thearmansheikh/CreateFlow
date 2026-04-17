import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function CallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  redirect("/auth/sign-in")
}
