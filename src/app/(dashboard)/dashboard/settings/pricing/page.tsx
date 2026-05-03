"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Zap, Crown, ArrowRight, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    credits: 50,
    gradient: "from-slate-500 to-gray-500",
    icon: Sparkles,
    features: [
      "50 credits on signup",
      "AI image generation",
      "AI copywriting",
      "Content library (100 items)",
      "1 brand profile",
      "Basic analytics",
    ],
    isSubscription: false,
    popular: false,
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "/month",
    credits: 500,
    gradient: "from-violet-500 to-purple-500",
    icon: Zap,
    features: [
      "500 credits/month",
      "Everything in Free",
      "AI video generation",
      "AI music generation",
      "Unlimited content library",
      "5 brand profiles",
      "Schedule to all platforms",
      "Repurpose engine",
      "Priority support",
    ],
    isSubscription: true,
    popular: true,
  },
  {
    name: "Business",
    price: "Custom",
    period: "",
    credits: "Unlimited",
    gradient: "from-amber-500 to-orange-500",
    icon: Crown,
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
    isSubscription: false,
    popular: false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (isSubscription: boolean, planName: string) => {
    if (!isSubscription) {
      if (planName === "Business") {
        window.location.href = "mailto:hello@thearmansheikh.co?subject=CreateFlow%20Business%20Plan%20Inquiry"
      }
      return
    }

    setLoading(planName)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "subscription" }),
      })
      const data = await res.json()
      if (data.checkoutUrl) window.location.href = data.checkoutUrl
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
          Start free with 50 credits. Upgrade to Pro for $4.99/mo when you need more.
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
              <CardDescription>
                {typeof plan.credits === "number"
                  ? `${plan.credits.toLocaleString()} credits / month`
                  : `${plan.credits} credits`}
              </CardDescription>
              <div className="mt-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
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
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan.isSubscription, plan.name)}
                disabled={loading === plan.name}
              >
                {loading === plan.name ? (
                  "Redirecting..."
                ) : plan.name === "Business" ? (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Sales
                  </>
                ) : plan.isSubscription ? (
                  "Get Started"
                ) : (
                  "Start Free"
                )}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
