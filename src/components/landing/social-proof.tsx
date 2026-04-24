"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Wand2, Zap, Send, BarChart3 } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Wand2,
    title: "Generate",
    description: "Use AI to create images, videos, music, or copy from a simple text prompt.",
  },
  {
    step: "02",
    icon: Zap,
    title: "Refine",
    description: "Adjust tone, style, and format. Apply your brand kit for consistent output.",
  },
  {
    step: "03",
    icon: Send,
    title: "Schedule",
    description: "Pick your platforms and schedule posts from the content calendar.",
  },
  {
    step: "04",
    icon: BarChart3,
    title: "Analyze",
    description: "Track performance and optimize your content strategy over time.",
  },
]

export default function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="relative py-24 sm:py-32" ref={ref}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-muted-foreground mb-6">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            From idea to published in{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              four steps
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            CreateFlow streamlines your entire content workflow — generation, refinement, scheduling, and analytics.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {steps.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="relative p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-purple-500/30 transition-all duration-300"
              >
                {/* Step number */}
                <div className="absolute -top-3 -right-2 text-5xl font-bold text-white/[0.04] select-none">
                  {item.step}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 mb-4">
                  <Icon className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            )
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-[0_0_40px_rgba(124,58,237,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Try It Now — It's Free
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
