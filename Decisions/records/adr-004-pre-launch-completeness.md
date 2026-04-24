# Pre-Launch Completeness — ADR 004

## SEO & Discoverability

### Sitemap
- Created `src/app/sitemap.ts` - dynamic sitemap generation
- Covers: home, privacy, terms, auth pages
- Excludes `/dashboard/` and `/api/` routes

### Robots.txt
- Created `public/robots.txt`
- Allows all crawling except `/dashboard/` and `/api/`
- Points to sitemap location

### OG & Social Meta Tags
- Root layout includes full OpenGraph config:
  - `og:title`, `og:description`, `og:image` (`/og-image.png`)
  - `og:url`, `og:locale` (en_GB), `og:siteName`
- Twitter Card config: `summary_large_image` with same image
- JSON-LD structured data added as `SoftwareApplication` schema
- Dynamic page titles using template pattern

### Hero Image Optimization
- Converted from `<img>` to Next.js `<Image>` component
- Uses `fill` + `priority` for LCP optimisation
- Added proper `alt` text for accessibility

### Navigation Enhancement
- Added "About" link to navbar
- Removed old "Features" / "Pricing" only configuration
- Added "Sign In" link to nav for returning users

## Pages & Sections

### Custom 404 Page
- Created `src/app/not-found.tsx`
- Branded 404 with gradient text, CreateFlow logo
- Links back to home and dashboard
- Contact email for reporting issues

### About Section
- Created `src/components/landing/about-section.tsx`
- Personal story from solo developer perspective
- Trust-building narrative about why CreateFlow exists
- Founder attribution: Arman Sheikh
- Integrated into landing page between How It Works and Social Proof

### Forgot Password Flow
- Created `src/app/auth/forgot-password/page.tsx`
- Uses Supabase `resetPasswordForEmail`
- Links to sign-in page
- Success state with confirmation message

## Auth Security

### Email Enumeration Prevention
- Sign-in form returns generic error: "Invalid email or password"
- No differentiation between "email not found" and "wrong password"

### Honeypot Anti-Bot Protection
- Hidden `website` field in sign-up form
- Invisible to humans, catches automated submissions
- Silently succeeds if filled (no error to tip off bots)

### Autocomplete Attributes
- Sign-up: `name`, `email`, `new-password`
- Sign-in: `email`, `current-password`
- Improves password manager compatibility

### Forgot Password Link
- Added to sign-in page below password field
- Links to `/auth/forgot-password`

## Open Items (Requires Manual Action)
- **OG Image**: Need to create `/public/og-image.png` (1200x630) for social sharing previews
- **Google OAuth**: Requires Supabase dashboard configuration (Google Cloud Console credentials)
- **Rate Limiting**: Supabase handles basic auth throttling, but Upstash/Vercel Edge rate limiting recommended for production
- **Email Verification**: Supabase sends verification emails - flow exists in sign-up success state
- **Account Deletion**: Not yet implemented - needs settings page with Supabase user deletion
- **Help Center Link**: Footer links to `/help-center` - needs page creation

## Date
2025-04-20
