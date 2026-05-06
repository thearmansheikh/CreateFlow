"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Check, Sparkles, Crown, Zap, HelpCircle } from "lucide-react"

const plans = [
  {
    name: "Free",
    icon: Sparkles,
    price: "£0",
    description: "50 credits \u2014 perfect for trying out CreateFlow",
    features: [
      "50 credits on signup",
      "AI image & copy generation",
      "1 brand profile",
      "Content library (100 items)",
      "Basic analytics",
      "Community support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    icon: Zap,
    price: "£4.99",
    period: "/month",
    description: "For serious content creators",
    features: [
      "500 credits / month",
      "All AI models (image, video, music, copy)",
      "Unlimited content library",
      "5 brand profiles",
      "Content scheduling",
      "Repurpose engine",
      "Priority support",
    ],
    cta: "Start for £4.99",
    popular: true,
    launchPrice: true,
  },
  {
    name: "Business",
    icon: Crown,
    price: "Custom",
    description: "For teams and agencies",
    features: [
      "Unlimited credits",
      "Everything in Pro, plus:",
      "Unlimited brand profiles",
      "Unlimited team members",
      "White-label options",
      "API access",
      "Custom AI fine-tuning",
      "Dedicated support & SLA",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

const creditBreakdown = [
  { action: "Generate an image", cost: "3 credits" },
  { action: "Write social copy", cost: "1 credit" },
  { action: "Generate a video clip", cost: "5 credits" },
  { action: "Generate a music track", cost: "3 credits" },
  { action: "Repurpose content", cost: "1 credit" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

export default function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="pricing" className="relative py-24 sm:py-32 overflow-hidden" ref={ref}>
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-muted-foreground mb-6">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Simple pricing, <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">unlimited potential</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees, cancel anytime.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            All prices shown in GBP.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              className={`relative rounded-2xl border p-6 sm:p-8 flex flex-col transition-all duration-300 hover:shadow-2xl ${
                plan.popular
                  ? "border-purple-500/50 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent shadow-[0_0_40px_rgba(124,58,237,0.15)]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                  \U0001f389 Launch Price
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      plan.popular
                        ? "bg-gradient-to-br from-purple-500 to-cyan-500 text-white"
                        : "bg-white/10 text-muted-foreground"
                    }`}
                  >
                    <plan.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="mb-8 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.name === "Business" ? (
                <a
                  href="mailto:hello@thearmansheikh.co?subject=CreateFlow%20Business%20Inquiry"
                  className="block w-full py-3 rounded-xl text-center text-sm font-semibold border border-white/20 text-foreground hover:bg-white/[0.06] transition-all"
                >
                  {plan.cta}
                </a>
              ) : (
                <Link
                  href="/auth/sign-up"
                  className={`block w-full py-3 rounded-xl text-center text-sm font-semibold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]"
                      : "border border-white/20 text-foreground hover:bg-white/[0.06]"
                  }`}
                >
                  {plan.cta}
                </Link>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Credit breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">What does 1 credit get you?</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {creditBreakdown.map((item) => (
                <div
                  key={item.action}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                >
                  <span className="text-sm text-muted-foreground">{item.action}</span>
                  <span className="text-sm font-medium text-primary">{item.cost}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground text-center">
              Credits refresh monthly on paid plans. Unused credits from the Free plan do not roll over.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
