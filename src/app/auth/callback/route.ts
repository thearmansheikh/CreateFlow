import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const errorParam = request.nextUrl.searchParams.get("error")

  // Handle OAuth error from provider
  if (errorParam) {
    return NextResponse.redirect(
      new URL(`/auth/sign-in?error=${encodeURIComponent(errorParam)}`, request.url)
    )
  }

  // No code means something went wrong
  if (!code) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url))
  }

  // Collect cookies to set
  const cookiesToSet: { name: string; value: string; options?: { [key: string]: any } }[] = []

  // Create Supabase client that captures cookies
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSetArray) {
          cookiesToSet.push(...cookiesToSetArray)
        },
      },
    }
  )

  // Exchange the authorization code for a session
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("OAuth exchange failed:", error.message)
    return NextResponse.redirect(
      new URL(`/auth/sign-in?error=${encodeURIComponent(error.message)}`, request.url)
    )
  }

  // Create redirect response with cookies
  const redirectUrl = new URL("/dashboard", request.url)
  const response = NextResponse.redirect(redirectUrl)

  // Manually set the cookies on the redirect response
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options)
  }

  return response
}
