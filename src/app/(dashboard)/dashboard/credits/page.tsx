"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, ZapOff, Loader2, CheckCircle2, Clock, XCircle, ArrowUpRight } from "lucide-react"

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  created_at: string
}

const CREDIT_PACKS = [
  { credits: 100, price: 5, popular: false, label: "Starter" },
  { credits: 500, price: 20, popular: true, label: "Pro" },
  { credits: 1500, price: 50, popular: false, label: "Agency" },
]

export default function CreditsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [creditsBalance, setCreditsBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/sign-in")
      return
    }

    const { data: member } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single() as any

    if (member) setWorkspaceId(member.workspace_id)

    const { data: userData } = await supabase
      .from("users")
      .select("credits_balance")
      .eq("id", user.id)
      .single() as any

    setCreditsBalance(userData?.credits_balance || 0)

    const { data: txData } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    setTransactions(txData || [])
    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handlePurchase = async (pack: { credits: number; price: number }) => {
    setPurchasing(pack.credits.toString())

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "credits",
          credits: pack.credits,
          priceId: null,
        }),
      })

      const data = await res.json()

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert(data.error || "Failed to create checkout session")
      }
    } catch {
      alert("Network error. Please try again.")
    } finally {
      setPurchasing(null)
    }
  }

  const costPerCredit = (pack: { credits: number; price: number }) => {
    return ((pack.price / pack.credits) * 100).toFixed(1)
  }

  const totalGenerated = transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-8 overflow-auto p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Credits</h1>
        <p className="mt-1 text-muted-foreground">Manage your credits and purchase more to keep creating.</p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{creditsBalance}</span>
              <span className="text-sm text-muted-foreground">credits</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold">{totalGenerated}</span>
              <span className="text-sm text-muted-foreground">credits used</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credit Cost</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-3.5 w-3.5 text-yellow-500" />
              <span>Image: <strong>3</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-3.5 w-3.5 text-purple-500" />
              <span>Video: <strong>5</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-3.5 w-3.5 text-green-500" />
              <span>Music: <strong>3</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-3.5 w-3.5 text-orange-500" />
              <span>Copy: <strong>1</strong></span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Packs */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Buy Credits</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CREDIT_PACKS.map((pack) => (
            <Card key={pack.credits} className={pack.popular ? "border-primary ring-1 ring-primary/20" : ""}>
              {pack.popular && (
                <div className="flex justify-center">
                  <Badge className="-mt-3 rounded-full bg-primary">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{pack.label}</CardTitle>
                <CardDescription>
                  {pack.credits.toLocaleString()} credits
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <div className="text-4xl font-bold">${pack.price}</div>
                <p className="text-sm text-muted-foreground">${costPerCredit(pack)}¢ per credit</p>
                <p className="text-xs text-muted-foreground">
                  {pack.credits} generations × 1 credit
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handlePurchase(pack)}
                  disabled={purchasing !== null}
                >
                  {purchasing === pack.credits.toString() ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Buy {pack.credits.toLocaleString()} Credits
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Transaction History</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {transactions.map((tx) => {
                  const isPositive = tx.amount > 0
                  const Icon = isPositive ? ArrowUpRight : ZapOff
                  const color = isPositive ? "text-green-500" : "text-red-500"

                  return (
                    <div key={tx.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-secondary ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={`font-mono text-sm font-semibold ${color}`}>
                        {isPositive ? "+" : ""}{tx.amount}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
