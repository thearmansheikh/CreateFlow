# ADR-001: Theme & Color System

**Date:** 2025-04-17
**Status:** Accepted

## Context
CreateFlow is an AI-powered creative CMS targeting content creators, freelancers, and agencies. The visual identity needs to feel premium, creative, and modern — not corporate or generic.

## Decision
We use a deep near-black background (`hsl(240 10% 4%)`) with vibrant violet primary (`hsl(263 70% 54%)`) as the brand accent.

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| background | hsl(240 10% 4%) | Page background — deep charcoal, not pure black |
| card | hsl(240 10% 6%) | Card surfaces — slightly lighter |
| primary | hsl(263 70% 54%) | Violet accent — CTAs, active states, links |
| muted-foreground | hsl(240 4% 58%) | Secondary text |
| border | hsl(240 6% 14%) | Subtle dividers |
| destructive | hsl(0 62% 30%) | Errors, delete actions |

### Rationale
- Violet communicates creativity and innovation — more distinctive than the typical SaaS blue
- Near-black background reduces eye strain for creators working long sessions
- Higher border radius (0.75rem) for a softer, more modern feel
- Gradient accents on generator cards use varied colors (blue, violet, pink, amber) to differentiate content types

## Alternatives Considered
- **Blue primary (default):** Too generic, looks like every other SaaS
- **Light theme:** Creators work in dark environments; dark-first is better UX
- **Pure black (#000):** Too harsh; warm charcoal is more comfortable

## Consequences
- All components must respect CSS variable tokens — no hardcoded colors
- Feature pages use accent gradients that harmonize with the violet primary
