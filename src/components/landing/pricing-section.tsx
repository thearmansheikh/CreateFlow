"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Check, Sparkles, Crown, Zap } from "lucide-react"

const plans = [
  {
    name: "Starter",
    icon: Sparkles,
    price: "$0",
    description: "Perfect for trying out CreateFlow",
    features: [
      "50 AI generations / month",
      "Basic image & copy generation",
      "1 connected platform",
      "Community support",
      "Content calendar (basic)",
    ],
    cta: "Get Started Free",
    popular: false,
    color: "from-muted to-muted",
  },
  {
    name: "Creator",
    icon: Zap,
    price: "$29",
    period: "/month",
    description: "For serious content creators",
    features: [
      "500 AI generations / month",
      "All AI models (image, video, music, copy)",
      "Unlimited platform connections",
      "Repurpose engine",
      "Brand kit (up to 3 brands)",
      "Priority support",
      "Advanced analytics",
    ],
    cta: "Start Free Trial",
    popular: true,
    color: "from-purple-500 to-cyan-500",
  },
  {
    name: "Agency",
    icon: Crown,
    price: "$99",
    period: "/month",
    description: "For teams and agencies",
    features: [
      "Unlimited AI generations",
      "Everything in Creator, plus:",
      "Team collaboration (up to 10)",
      "Client management",
      "White-label reports",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    popular: false,
    color: "from-muted to-muted",
  },
]

export default function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="pricing" className="relative py-32">
      {/* Background */}
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px]" />

      <div ref={ref} className="relative container mx-auto px-4 md:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-purple-400 mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Simple pricing,{" "}
            <span className="gradient-text">unlimited potential</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free, scale as you grow. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className={`relative p-8 rounded-2xl transition-all ${
                plan.popular
                  ? "glass-strong border-gradient glow-purple scale-[1.02]"
                  : "glass hover:border-white/[0.1] transition-colors"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              {/* Plan icon */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${plan.popular ? "from-purple-500 to-cyan-500" : "from-white/[0.1] to-white/[0.05]"} flex items-center justify-center`}>
                  <plan.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold">{plan.name}</span>
              </div>

              {/* Price */}
              <div className="mb-2">
                <span className="text-5xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
              </div>
              <p className="text-sm text-muted-foreground mb-8">{plan.description}</p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/auth/sign-up"
                className={`block w-full py-3 rounded-xl text-center text-sm font-semibold transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]"
                    : "glass text-foreground hover:bg-white/[0.06]"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
