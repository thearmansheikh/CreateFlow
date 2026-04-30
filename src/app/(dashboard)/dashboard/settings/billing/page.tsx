"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, ArrowRight, Check, Zap, Mail, Clock } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const tiers = [
  {
    name: "Free",
    price: "$0",
    credits: 50,
    description: "Try CreateFlow with 50 free credits",
    features: [
      "50 credits on signup",
      "AI image generation",
      "AI copywriting",
      "Content library (100 items)",
      "1 brand profile",
      "Basic analytics",
    ],
    priceId: null,
    current: true,
  },
  {
    name: "Pro",
    price: "$4.99",
    credits: 500,
    description: "For solo content creators",
    features: [
      "500 credits / month",
      "All AI generators (image, video, music, copy)",
      "Unlimited content library",
      "5 brand profiles",
      "Content scheduling",
      "Repurpose engine",
      "No watermarks",
      "Priority support",
    ],
    priceId: "price_pro_monthly",
    highlight: true,
  },
  {
    name: "Business",
    price: "Custom",
    credits: "∞",
    description: "For teams and agencies",
    features: [
      "Unlimited credits",
      "Everything in Pro",
      "Unlimited brand profiles",
      "Unlimited team members",
      "White-label options",
      "API access",
      "Custom AI fine-tuning",
      "Dedicated support",
      "SLA guarantee",
    ],
    priceId: null,
  },
]

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (priceId: string | null) => {
    if (!priceId) {
      window.location.href = "mailto:hello@thearmansheikh.co?subject=CreateFlow%20Business%20Plan%20Inquiry"
      return
    }

    setLoading(priceId)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "subscription", priceId }),
      })
      const data = await res.json()
      if (data.checkoutUrl) window.location.href = data.checkoutUrl
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Billing & Credits</h1>
        <p className="mt-1 text-muted-foreground">Manage your subscription and credit balance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={cn(
              "relative",
              tier.highlight && "border-primary shadow-lg shadow-primary/10"
            )}
          >
            {tier.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div>
                <span className="text-3xl font-bold">{tier.price}</span>
                {tier.price !== "$0" && tier.price !== "Custom" && (
                  <span className="text-sm text-muted-foreground">/month</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{tier.credits} credits</p>
            </CardHeader>
            <CardContent>
              <ul className="mb-6 space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {tier.current ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(tier.priceId)}
                  disabled={loading === tier.priceId}
                >
                  {loading === tier.priceId ? (
                    "Redirecting..."
                  ) : tier.name === "Business" ? (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Sales
                    </>
                  ) : (
                    `Upgrade to ${tier.name}`
                  )}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Credit costs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-muted-foreground" />
                Credit Costs
              </CardTitle>
              <CardDescription>How many credits each generation uses</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/settings/billing/history">
                <Clock className="mr-2 h-4 w-4" />
                Billing History
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CostItem type="Image" cost="3 credits" detail="per image" />
            <CostItem type="Video" cost="5 credits" detail="per video" />
            <CostItem type="Music" cost="3 credits" detail="per track" />
            <CostItem type="Copy" cost="1 credit" detail="per generation" />
          </div>
        </CardContent>
      </Card>

      {/* One-time credit packs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            Buy Credits One-Time
          </CardTitle>
          <CardDescription>Don't need a subscription? Buy credits à la carte.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold">100 credits</p>
              <p className="text-lg text-primary">$5</p>
              <p className="text-xs text-muted-foreground">5¢ per credit</p>
            </div>
            <div className="rounded-lg border border-primary/50 p-4 text-center">
              <p className="text-2xl font-bold">500 credits</p>
              <p className="text-lg text-primary">$20</p>
              <p className="text-xs text-muted-foreground">4¢ per credit</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold">1,500 credits</p>
              <p className="text-lg text-primary">$50</p>
              <p className="text-xs text-muted-foreground">3.3¢ per credit</p>
            </div>
          </div>
          <Button className="mt-4 w-full sm:w-auto" onClick={() => (window.location.href = "/dashboard/credits")}>
            Go to Credits Page <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function CostItem({ type, cost, detail }: { type: string; cost: string; detail: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="font-medium">{type}</p>
      <p className="text-sm text-primary">{cost}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}
