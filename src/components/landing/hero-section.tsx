"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"

export default function HeroSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24"
    >
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/15 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 container mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center lg:text-left"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-muted-foreground">Now in early access — Join the waitlist</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
          >
            Create{" "}
            <span className="gradient-text">Everything</span>
            <br />
            Publish{" "}
            <span className="gradient-text">Everywhere</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            The AI-powered platform for creators — generate images, video, music
            &amp; copy, then publish to all platforms in one click.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Link
              href="/auth/sign-up"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-600" />
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative">Start for Free</span>
              <svg className="relative w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <button className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-medium text-foreground glass transition-all hover:bg-white/[0.06]">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Demo
            </button>
          </motion.div>

          {/* Social proof mini */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="mt-10 flex items-center gap-4 justify-center lg:justify-start"
          >
            <div className="flex -space-x-2">
              {["bg-purple-500", "bg-cyan-500", "bg-pink-500", "bg-yellow-500"].map((bg, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-bold text-white`}>
                  {["A", "B", "C", "D"][i]}
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">2,400+</span> creators on the waitlist
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative h-[400px] lg:h-[600px]"
        >
          {/* Glow behind image */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 rounded-3xl blur-3xl" />
          <div className="relative h-full rounded-2xl overflow-hidden glass animate-float group">
            {/* Gradient border overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 z-10 pointer-events-none" />
            <img
              src="/images/hero-dashboard.png"
              alt="CreateFlow - AI-powered creative platform preview"
              className="w-full h-full object-cover"
            />
            {/* Subtle vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/40 via-transparent to-transparent z-10 pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
