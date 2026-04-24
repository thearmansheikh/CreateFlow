"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

export default function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="about" className="relative py-24 sm:py-32 overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.03] to-transparent pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-muted-foreground mb-6">
            Our Story
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Built by a creator, <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">for creators</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-lg prose-invert mx-auto text-center"
        >
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            CreateFlow started from a simple frustration: as a solo content creator, I was juggling six different tools just to publish one piece of content. AI generators here, scheduling tools there, analytics somewhere else — and nothing talked to each other.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mt-4">
            So I built the tool I wished existed. A single platform where you can generate images, video, music, and copy with AI — then organise, schedule, and publish everything across all your platforms. No more context switching. No more lost files. Just one workspace for everything you create.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mt-4">
            This is a labour of love from a solo developer who believes creators deserve better tools. Every feature is built with real user feedback, not boardroom metrics.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex justify-center"
        >
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-lg font-bold text-white">
              A
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Arman Sheikh</p>
              <p className="text-xs text-muted-foreground">Founder &amp; Solo Developer</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
