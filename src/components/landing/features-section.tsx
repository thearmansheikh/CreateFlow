"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import {
  Sparkles,
  Video,
  Music,
  PenTool,
  Share2,
  Repeat2,
} from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI Image Generation",
    description: "Create stunning visuals from text prompts. Photorealistic, artistic, or abstract — your imagination is the only limit.",
    color: "from-purple-500 to-pink-500",
    iconColor: "text-purple-400",
  },
  {
    icon: Video,
    title: "Video Creation",
    description: "Transform static images into dynamic video content. AI-powered motion, transitions, and effects.",
    color: "from-cyan-500 to-blue-500",
    iconColor: "text-cyan-400",
  },
  {
    icon: Music,
    title: "Music & Audio",
    description: "Generate original music tracks and soundscapes. Royalty-free content tailored to your brand's vibe.",
    color: "from-pink-500 to-rose-500",
    iconColor: "text-pink-400",
  },
  {
    icon: PenTool,
    title: "AI Copywriting",
    description: "Captions, headlines, blog posts — AI that learns your brand voice and generates on-brand copy every time.",
    color: "from-amber-500 to-orange-500",
    iconColor: "text-amber-400",
  },
  {
    icon: Share2,
    title: "Multi-Platform Publishing",
    description: "Publish to Instagram, TikTok, YouTube, Twitter, and LinkedIn from one dashboard. One click, everywhere.",
    color: "from-green-500 to-emerald-500",
    iconColor: "text-green-400",
  },
  {
    icon: Repeat2,
    title: "Repurpose Engine",
    description: "Turn one blog post into 10 social posts, 3 videos, and an infographic. Maximum reach from minimum effort.",
    color: "from-violet-500 to-purple-500",
    iconColor: "text-violet-400",
  },
]

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 12
    const rotateY = (centerX - x) / 12

    ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }

  const handleMouseLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative p-8 rounded-2xl glass transition-transform duration-200 ease-out cursor-default"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Hover gradient */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300`} />

      {/* Icon */}
      <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-[1px] mb-6`}>
        <div className="w-full h-full rounded-xl bg-[#0a0a0a] flex items-center justify-center">
          <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-8 right-8 h-[2px] bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-all duration-300 origin-left scale-x-0 group-hover:scale-x-100`} />
    </motion.div>
  )
}

export default function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="features" className="relative py-32">
      {/* Background accents */}
      <div className="absolute inset-0 dot-bg opacity-50" />
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />

      <div ref={ref} className="relative container mx-auto px-4 md:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-purple-400 mb-4">
            <Sparkles className="w-4 h-4" />
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Everything you need to{" "}
            <span className="gradient-text">create &amp; grow</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete creative studio and content management platform — all powered by AI.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
