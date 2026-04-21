"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Sparkles, Settings, Rocket } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Sparkles,
    title: "Generate",
    description: "Describe what you want — image, video, music, or copy. Our AI creates it in seconds, not hours.",
    color: "from-purple-500 to-purple-700",
  },
  {
    number: "02",
    icon: Settings,
    title: "Customize",
    description: "Fine-tune with your brand kit. Colors, fonts, tone of voice — everything stays on-brand automatically.",
    color: "from-cyan-500 to-cyan-700",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Publish",
    description: "Schedule or publish instantly to every platform. One piece of content, everywhere your audience is.",
    color: "from-pink-500 to-pink-700",
  },
]

export default function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/5 to-transparent" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px]" />

      <div ref={ref} className="relative container mx-auto px-4 md:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-cyan-400 mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Three steps to{" "}
            <span className="gradient-text">content mastery</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-pink-500/30" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative text-center"
            >
              {/* Step number */}
              <div className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} mx-auto mb-6 flex items-center justify-center shadow-lg`}>
                <step.icon className="w-7 h-7 text-white" />
              </div>

              {/* Number badge */}
              <div className="text-6xl font-black text-white/[0.03] absolute -top-4 left-1/2 -translate-x-1/2 select-none">
                {step.number}
              </div>

              <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
