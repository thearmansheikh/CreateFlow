"use client"

import dynamic from "next/dynamic"
import Navbar from "@/components/landing/navbar"
import HeroSection from "@/components/landing/hero-section"
import FeaturesSection from "@/components/landing/features-section"
import HowItWorksSection from "@/components/landing/how-it-works"
import SocialProofSection from "@/components/landing/social-proof"
import PricingSection from "@/components/landing/pricing-section"
import CTASection from "@/components/landing/cta-section"
import Footer from "@/components/landing/footer"

const ParticleBackground = dynamic(
  () => import("@/components/landing/particle-background"),
  { ssr: false, loading: () => null }
)

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SocialProofSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  )
}
