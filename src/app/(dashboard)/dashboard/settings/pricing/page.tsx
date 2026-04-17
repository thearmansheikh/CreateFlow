"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Zap, Crown, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Creator",
    price: "$19",
    period: "/month",
    credits: 500,
    gradient: "from-blue-500 to-cyan-500",
    icon: Sparkles,
    features: ["500 credits/month", "AI image generation", "AI video generation", "AI music generation", "AI copywriting", "Content library (1,000 items)", "3 brand profiles", "Schedule to 3 platforms", "Basic analytics"],
    priceId: "price_creator_monthly",
    popular: false,
  },
  {
    name: "Agency",
    price: "$49",
    period: "/month",
    credits: 2000,
    gradient: "from-violet-500 to-purple-500",
    icon: Zap,
    features: ["2,000 credits/month", "Everything in Creator", "Unlimited content library", "10 brand profiles", "Schedule to all platforms", "Team collaboration (5 members)", "Advanced analytics", "Repurpose engine", "Priority support"],
    priceId: "price_agency_monthly",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    credits: 10000,
    gradient: "from-amber-500 to-orange-500",
    icon: Crown,
    features: ["10,000 credits/month", "Everything in Agency", "Unlimited brand profiles", "Unlimited team members", "White-label options", "API access", "Custom AI model fine-tuning", "Dedicated support", "SLA guarantee"],
    priceId: "price_enterprise_monthly",
    popular: false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string) => {
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
      console.error("Checkout failed", e)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Choose your plan</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Start free with 50 credits. Upgrade when you need more.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={cn("relative flex flex-col", plan.popular && "border-primary shadow-lg shadow-primary/10")}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Most Popular</div>
            )}
            <CardHeader>
              <div className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${plan.gradient} text-white`}>
                <plan.icon className="h-5 w-5" />
              </div>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.credits.toLocaleString()} credits / month</CardDescription>
              <div className="mt-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <div className="p-6 pt-0">
              <Button className="w-full" variant={plan.popular ? "default" : "outline"} onClick={() => handleSubscribe(plan.priceId)} disabled={loading === plan.priceId}>
                {loading === plan.priceId ? "Redirecting..." : plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
