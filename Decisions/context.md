# CreateFlow — Context

## What It Is
AI-powered creative content management studio. Combines AI generation (images, video, music, copy) with content management, scheduling, publishing, and analytics — all in one platform.

## Target Users
- Solo content creators (TikTok, Instagram, YouTube)
- Freelance social media managers
- Small businesses and brand owners
- Digital marketing agencies managing multiple client brands

## Unique Value Proposition
- One platform for creating AND managing content (competitors do one or the other)
- AI that learns brand voice, visual style, and tone
- Generate music and video — not just just images and text
- Repurpose one piece of content into multiple formats with one click

## Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes (Serverless)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth
- **Payments:** Stripe
- **AI:** Claude API (text), Replicate (image/video), FAL.ai (image), Suno API (music)

## Build Phases
1. Foundation & Auth (Weeks 1-2)
2. Dashboard & Content Library (Weeks 3-4)
3. AI Generation Suite (Weeks 5-7)
4. Credit System & Stripe (Week 8)
5. Brand Kit System (Weeks 9-10)
6. Repurpose Engine (Weeks 11-12)
7. Publishing & Scheduling (Weeks 13-15)
8. Analytics Module (Weeks 16-17)
9. Collaboration & Roles (Week 18)
10. Mobile Experience & Polish (Weeks 19-20)

## Key Decisions
- App Router pattern (not Pages Router)
- shadcn/ui for component base
- RBAC: owner, editor, viewer, admin roles
- Credit-based usage model (not subscription-only)
- Supabase for database, auth, and storage
