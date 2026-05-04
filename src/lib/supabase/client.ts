import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

function parseCookies() {
  // SSR-safe: return empty when document is unavailable; the client will
  // hydrate and re-read on the browser.
  if (typeof document === 'undefined') return {}
  return document.cookie.split('; ').reduce<{ [key: string]: string }>((acc, cookie) => {
    const [name, ...rest] = cookie.split('=')
    if (name) acc[name] = decodeURIComponent(rest.join('='))
    return acc
  }, {})
}

function setCookie(name: string, value: string, options: { maxAge?: number; path?: string; secure?: boolean; sameSite?: 'lax' | 'strict' | 'none' }) {
  if (typeof document === 'undefined') return
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
  if (options.maxAge !== undefined) cookie += `; Max-Age=${options.maxAge}`
  if (options.path) cookie += `; Path=${options.path}`
  if (options.secure) cookie += `; Secure`
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`
  document.cookie = cookie
}

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = parseCookies()
          return Object.entries(cookies).map(([name, value]) => ({ name, value }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            setCookie(name, value, {
              maxAge: options.maxAge,
              path: options.path,
              secure: options.secure,
              sameSite: options.sameSite as 'lax' | 'strict' | 'none' | undefined,
            })
          })
        },
      },
    }
  )
}
