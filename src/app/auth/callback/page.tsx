import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

interface Props {
  searchParams: { code?: string; error?: string } | Promise<{ code?: string; error?: string }>
}

export default async function CallbackPage(props: Props) {
  const searchParams = "then" in props.searchParams 
    ? await props.searchParams 
    : props.searchParams

  const supabase = await createClient()

  const code = searchParams.code
  const errorParam = searchParams.error

  // Handle OAuth error from provider
  if (errorParam) {
    redirect(`/auth/sign-in?error=${encodeURIComponent(errorParam)}`)
  }

  // Exchange authorization code for session
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error("OAuth exchange failed:", error.message)
      redirect(`/auth/sign-in?error=${encodeURIComponent(error.message)}`)
    }
  }

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  redirect("/auth/sign-in")
}
