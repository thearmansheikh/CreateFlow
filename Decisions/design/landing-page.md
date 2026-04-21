# Landing Page Design

## Date
2025-01-07

## Decision
Landing page uses a dark, futuristic, premium design inspired by Linear.app and Midjourney.

## Visual Identity
- **Theme:** Dark (#0a0a0a base)
- **Primary:** Purple (#7c3aed) — used for CTAs, accents, gradients
- **Secondary:** Cyan (#06b6d4) — used for secondary accents, gradient endpoints
- **Gradients:** Purple → Cyan for hero text, buttons, borders
- **Glassmorphism:** Frosted glass cards with `backdrop-filter: blur()` and subtle borders
- **Background:** Deep black with dot pattern and grid pattern overlays

## Animation System
- **Framer Motion:** Scroll-triggered reveals, staggered card animations, smooth transitions
- **React Three Fiber:** 3D particle background with floating orbs (purple/cyan)
- **Spline:** 3D scene embedded in hero (right side) — floating dashboard mockup
- **CSS:** Float animation for hero image, pulse-glow for background orbs, shimmer for subtle effects

## Components Built
1. **Navbar** — Floating glassmorphism bar, shrinks on scroll
2. **Hero** — Full viewport, headline + Spline 3D scene + particle background
3. **Features** — 6 cards (3x2 grid) with 3D tilt on hover (rotateX/Y via mouse tracking)
4. **How It Works** — 3 steps with gradient connector line
5. **Social Proof** — Stats row (4 columns) + 3 testimonials
6. **Pricing** — 3 tiers (Starter/Creator/Agency) with gradient border on popular plan
7. **CTA** — Full-width glass card with gradient background
8. **Footer** — 6-column grid with brand, nav links, social icons

## Tech
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- Framer Motion (animation library)
- Three.js + @react-three/fiber + @react-three/drei (3D)
- @splinetool/react-spline (Spline integration)
- Lucide React (icons — brand icons as custom SVGs since v1.8.0 lacks them)
