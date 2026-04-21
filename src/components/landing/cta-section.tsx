"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"

export default function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section className="relative py-32">
      <div ref={ref} className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden"
        >
          {/* Card background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-[#0a0a0a] to-cyan-600/10" />
          <div className="absolute inset-0 glass" />

          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 w-[200px] h-[200px] bg-purple-600/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-1/4 w-[200px] h-[200px] bg-cyan-600/15 rounded-full blur-[80px]" />

          <div className="relative p-12 md:p-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-purple-400 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Early access — limited spots
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            >
              Ready to transform your{" "}
              <span className="gradient-text">content workflow</span>?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              Join thousands of creators already on the waitlist. Start creating
              and publishing AI-powered content — for free.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/auth/sign-up"
                className="group relative inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl text-base font-semibold text-white overflow-hidden transition-all hover:shadow-[0_0_50px_rgba(124,58,237,0.5)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600" />
                <span className="relative">Get Early Access</span>
                <svg className="relative w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl text-base font-medium text-foreground glass transition-all hover:bg-white/[0.06]"
              >
                Sign In Instead
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
