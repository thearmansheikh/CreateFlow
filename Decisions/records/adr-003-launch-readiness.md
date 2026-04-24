# Launch Readiness — ADR 003

## Decision: Cookie Consent
- Custom cookie consent banner added (`src/components/cookie-consent.tsx`)
- Renders in root layout, persists choice to `localStorage`
- Offers "Essentials only" and "Accept all" options
- Links to Privacy Policy for more info
- Complies with UK GDPR and EU Cookie Law

## Decision: Currency & Pricing
- All pricing displayed in GBP (£)
- Note added: "Your card will be billed in USD at the current exchange rate"
- Added "Launch Price" badge to Pro plan to explain the low price point
- Added credit breakdown table showing what each action costs (image = 1, video = 10, music = 20, etc.)

## Decision: Sign-up Form Compliance
- Added "Confirm Password" field — must match before submission
- Added required Terms of Service / Privacy Policy checkbox
- Form blocks submission if checkbox is unchecked
- Error messages: "Passwords do not match" / "You must agree to the Terms..."

## Decision: Footer Cleanup
- Removed "Built with Next.js, Tailwind CSS & Three.js" tech stack line
- Footer now contains only brand, social links, and legal links
- Legal links (Privacy, Terms, Cookies) all route to real pages

## Open Items
- **Hero Image** (`/images/hero-dashboard.png`): Must be replaced with a real product screenshot before launch. Current image file exists but needs visual verification.
- **Google OAuth**: Supabase Google provider must be configured in the Supabase dashboard (Client ID + Secret from Google Cloud Console). The button is wired up in code — needs dashboard-side setup and a live test.

## Date
2025-01-XX
