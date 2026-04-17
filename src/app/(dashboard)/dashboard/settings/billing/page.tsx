"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, ArrowRight, Check } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const tiers = [
  {
    name: "Free",
    price: "$0",
    credits: 50,
    description: "Try CreateFlow with 50 free credits",
    features: ["50 credits total", "Image generation", "Basic library", "1 brand profile"],
    current: true,
  },
  {
    name: "Creator",
    price: "$19",
    credits: 500,
    description: "For solo content creators",
    features: [
      "500 credits / month",
      "All AI generators",
      "Unlimited library",
      "5 brand profiles",
      "Content scheduling",
      "Basic analytics",
    ],
    priceId: "price_creator_monthly",
    highlight: true,
  },
  {
    name: "Agency",
    price: "$49",
    credits: 2000,
    description: "For teams managing multiple brands",
    features: [
      "2,000 credits / month",
      "All AI generators",
      "Unlimited library",
      "20 brand profiles",
      "Team collaboration (5 seats)",
      "Advanced analytics",
      "Priority support",
    ],
    priceId: "price_agency_monthly",
  },
]

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (priceId: string) => {
    setLoading(priceId)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
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
                {tier.price !== "$0" && <span className="text-sm text-muted-foreground">/month</span>}
              </div>
              <p className="text-sm text-muted-foreground">{tier.credits.toLocaleString()} credits</p>
            </CardHeader>
            <CardContent>
              <ul className="mb-6 space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
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
                  onClick={() => tier.priceId && handleUpgrade(tier.priceId)}
                  disabled={loading === tier.priceId}
                >
                  {loading === tier.priceId ? "Redirecting..." : `Upgrade to ${tier.name}`}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Credit usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            Credit Costs
          </CardTitle>
          <CardDescription>How many credits each generation uses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CostItem type="Image" cost="1 credit" detail="per image" />
            <CostItem type="Video" cost="10 credits" detail="per video (5-10s)" />
            <CostItem type="Music" cost="10 credits" detail="per track" />
            <CostItem type="Copy" cost="1 credit" detail="per generation" />
          </div>
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
