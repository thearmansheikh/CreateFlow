"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  User,
  CreditCard,
  Sparkles,
  Loader2,
  Check,
  AlertTriangle,
  LogOut,
  ArrowRight,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Tier = "free" | "pro" | "business" | "enterprise"

interface MeResponse {
  id: string
  email: string | null
  full_name: string | null
  credits_balance: number
  total_credits_used: number
  subscription_tier: Tier
}

const tierLabels: Record<Tier, { label: string; tone: string }> = {
  free: { label: "Free", tone: "bg-slate-500/15 text-slate-300 border-slate-500/30" },
  pro: { label: "Pro", tone: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  business: { label: "Business", tone: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  enterprise: { label: "Enterprise", tone: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
}

export default function SettingsPage() {
  const router = useRouter()
  const [me, setMe] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState("")
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: MeResponse | null) => {
        if (data) {
          setMe(data)
          setFullName(data.full_name ?? "")
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to save")
      }
      setSavedAt(Date.now())
      setMe((m) => (m ? { ...m, full_name: fullName } : m))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!me) {
    return (
      <div className="flex-1 p-6">
        <p className="text-sm text-destructive">Could not load your profile. Please refresh.</p>
      </div>
    )
  }

  const tier = tierLabels[me.subscription_tier] ?? tierLabels.free

  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile, plan, and account.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            Profile
          </CardTitle>
          <CardDescription>Your name and account email.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={me.email ?? ""} disabled />
              <p className="text-xs text-muted-foreground">
                Email is set at sign-up and can&rsquo;t be changed here yet. Contact support if you need to update it.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                maxLength={100}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving || fullName.trim() === (me.full_name ?? "")}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
              {savedAt && Date.now() - savedAt < 3000 && (
                <span className="flex items-center gap-1 text-sm text-emerald-400">
                  <Check className="h-4 w-4" />
                  Saved
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            Plan
          </CardTitle>
          <CardDescription>Your current subscription and credit balance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Current plan</span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${tier.tone}`}
              >
                {tier.label}
              </span>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/settings/billing">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage billing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Credits remaining</p>
              <p className="mt-1 text-2xl font-bold">{me.credits_balance.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Credits used (lifetime)</p>
              <p className="mt-1 text-2xl font-bold">{me.total_credits_used.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-muted-foreground" />
            Session
          </CardTitle>
          <CardDescription>Sign out of CreateFlow on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete account
          </CardTitle>
          <CardDescription>
            Permanently delete your account, content, and brand profiles. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            For security, account deletion is processed manually. Email us from the address on
            your account and we&rsquo;ll delete it within 30 days, as required by GDPR / CCPA.
          </p>
          <Button variant="destructive" asChild>
            <a
              href={`mailto:hello@thearmansheikh.co?subject=${encodeURIComponent("CreateFlow — Delete my account")}&body=${encodeURIComponent(
                `Please delete my CreateFlow account.\n\nAccount email: ${me.email ?? ""}\n`,
              )}`}
            >
              Request deletion
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
