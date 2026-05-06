import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About — CreateFlow",
  description: "CreateFlow is the all-in-one AI content studio for creators, founders, and small teams.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-purple-400 hover:text-purple-300 mb-8 inline-block"
        >
          ← Back to home
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">About CreateFlow</h1>
        <p className="text-slate-500 mb-8">The all-in-one AI content studio.</p>

        <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Why we built CreateFlow</h2>
            <p>
              Modern creators juggle five tools to ship one post: an image generator,
              a copywriter, a video editor, a scheduler, and a brand-consistency
              checker. Each one is a separate subscription, a separate login, and a
              separate place where your brand voice lives.
            </p>
            <p>
              CreateFlow puts all of those into one studio. Train it on your brand
              once — your tone, colour palette, product, and audience — and every
              generation after that stays on-brand by default.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">What you can do here</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Generate on-brand images, videos, music, and copy from a single prompt</li>
              <li>Repurpose one piece of content into a thread, a caption, a newsletter, and a YouTube script</li>
              <li>Schedule and publish to every major social platform from one calendar</li>
              <li>Manage multiple brand profiles inside a single workspace</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Who built it</h2>
            <p>
              CreateFlow is built and maintained by Arman Sheikh — a solo founder
              shipping fast, listening to users, and avoiding bloat.
            </p>
            <p>
              Have feedback, a feature request, or a bug? <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline">Get in touch</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Pricing philosophy</h2>
            <p>
              Free plan exists for real use, not just a trial. Pro is a flat £4.99/month
              with everything unlocked. We don't sell your data and we don't pad the
              price with feature tiers.
            </p>
          </section>
        </div>

        <div className="mt-12 flex gap-4">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]"
          >
            Try CreateFlow free
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-white/[0.06]"
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  )
}
