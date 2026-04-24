"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Sparkles, Image, Music, FileText, Video, Calendar, BarChart3 } from "lucide-react"

const features = [
  {
    icon: Image,
    title: "AI Image Generation",
    description: "Create stunning visuals from text prompts with Flux AI",
  },
  {
    icon: Video,
    title: "AI Video Generation",
    description: "Turn ideas into video clips in seconds",
  },
  {
    icon: Music,
    title: "AI Music Creation",
    description: "Generate original music and soundtracks",
  },
  {
    icon: FileText,
    title: "AI Copywriting",
    description: "Write captions, blogs, tweets, and emails with Claude",
  },
  {
    icon: Calendar,
    title: "Content Calendar",
    description: "Schedule and manage posts across all platforms",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track performance and optimize your content strategy",
  },
]

export default function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="features" className="relative py-24 sm:py-32" ref={ref}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <Sparkles className="w-4 h-4" />
            Features
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              create &amp; publish
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            One platform for generating AI content, managing your library, scheduling posts, and tracking performance.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="group p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-purple-500/30 hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 mb-4 group-hover:from-purple-500/30 group-hover:to-cyan-500/30 transition-all">
                  <Icon className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
