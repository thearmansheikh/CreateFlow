import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cookie Policy — CreateFlow",
  description: "How CreateFlow uses cookies and similar technologies.",
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-purple-400 hover:text-purple-300 mb-8 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">Cookie Policy</h1>
        <p className="text-slate-500 mb-8">Last updated: 2 May 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
          <p>
            This page explains what cookies and similar storage technologies CreateFlow uses,
            why we use them, and how you can control them. For broader detail on how we
            handle your data, see our <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</Link>.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">What is a cookie?</h2>
            <p>
              A cookie is a small piece of data stored in your browser by a website. We also
              use related technologies like <code className="px-1 py-0.5 bg-slate-800 rounded">localStorage</code> for the same purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Cookies we use</h2>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">Essential</h3>
            <p>
              Required for the site to work. We use them to keep you signed in (Supabase auth
              session), remember your active workspace, and protect against CSRF. You cannot
              disable these without breaking the app.
            </p>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">Functional</h3>
            <p>
              Remember your preferences — sidebar collapsed state, theme, last-used brand
              profile. Disabling them won&rsquo;t break the app, but you&rsquo;ll see defaults on every visit.
            </p>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">Payments</h3>
            <p>
              When you go through checkout we hand you off to Stripe, which sets its own
              cookies for fraud prevention and to keep your card details secure. See
              Stripe&rsquo;s <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">cookie notice</a> for details.
            </p>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">Analytics</h3>
            <p>
              We do not currently use third-party advertising or behaviour-tracking cookies.
              If we add product analytics in the future, we&rsquo;ll update this page and add a
              consent banner where required.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">How to control cookies</h2>
            <p>
              You can clear or block cookies via your browser settings. Doing so for the
              essential category will sign you out and break parts of the app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Questions</h2>
            <p>
              If you have questions about how we use cookies, contact us at{" "}
              <a href="mailto:hello@thearmansheikh.co" className="text-purple-400 hover:text-purple-300 underline">hello@thearmansheikh.co</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
