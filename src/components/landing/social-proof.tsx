"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Check, Users, Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Creator",
    content: "CreateFlow has completely changed how I work. I used to spend hours on content — now it's minutes. The AI understands my brand voice perfectly.",
    rating: 5,
  },
  {
    name: "Marcus Rivera",
    role: "Social Media Manager",
    content: "Managing 12 client accounts was chaos before CreateFlow. Now I can generate, schedule, and analyze everything from one dashboard.",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "Brand Owner",
    content: "The repurpose engine is insane. One blog post became a week's worth of social content. ROI is through the roof.",
    rating: 5,
  },
]

const stats = [
  { value: "2,400+", label: "Creators on waitlist" },
  { value: "10M+", label: "Images generated in beta" },
  { value: "98%", label: "Satisfaction rate" },
  { value: "5x", label: "Faster content creation" },
]

export default function SocialProofSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section className="relative py-32">
      <div ref={ref} className="container mx-auto px-4 md:px-6">
        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold gradient-text">{stat.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-amber-400 mb-4">
            <Star className="w-4 h-4" />
            What creators are saying
          </span>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 + index * 0.15 }}
              className="relative p-8 rounded-2xl glass"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.name[0]}
                </div>
                <div>
                  <div className="font-medium text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
