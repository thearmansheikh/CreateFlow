import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Changelog — CreateFlow",
  description: "Recent improvements, fixes, and new features in CreateFlow.",
}

type Entry = {
  date: string
  title: string
  tag: "feature" | "fix" | "improvement"
  bullets: string[]
}

const entries: Entry[] = [
  {
    date: "2026-05-02",
    title: "Launch readiness pass",
    tag: "fix",
    bullets: [
      "Stripe subscriptions now properly upgrade your plan and persist customer IDs.",
      "New Manage Subscription button opens the Stripe customer portal.",
      "Subscription cancellation, payment failures, and renewals are now handled by webhooks.",
      "Generations now correctly save to the content library and show up everywhere they should.",
      "Pricing page on the landing site now matches actual credit costs.",
      "Sign-up gained a Confirm Password field, ToS checkbox, and bot honeypot.",
      "Sign-in errors no longer leak whether an email exists.",
      "Analytics page now resolves the workspace correctly and stops returning zeros.",
    ],
  },
  {
    date: "2026-04-28",
    title: "Brand profiles get smarter",
    tag: "feature",
    bullets: [
      "Auto-select a default brand per workspace.",
      "Industry-specific brand template presets to start from.",
      "Upload brand examples to train the AI on your tone of voice.",
    ],
  },
  {
    date: "2026-04-20",
    title: "Content Library, AI pipeline, billing history",
    tag: "feature",
    bullets: [
      "Phase 2-4 ship: Content Library refresh, AI generation save pipeline, full billing history view.",
    ],
  },
  {
    date: "2026-04-10",
    title: "Repurpose engine + Analytics",
    tag: "feature",
    bullets: [
      "Turn one piece of content into a thread, caption, newsletter, or YouTube script.",
      "Analytics page wired to real data with model usage breakdowns.",
    ],
  },
]

const tagStyles: Record<Entry["tag"], string> = {
  feature: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  fix: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  improvement: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-purple-400 hover:text-purple-300 mb-8 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">Changelog</h1>
        <p className="text-slate-400 mb-12">
          What we&rsquo;ve shipped recently. Newest at the top.
        </p>

        <div className="space-y-10">
          {entries.map((entry) => (
            <article key={entry.date + entry.title} className="border-l-2 border-slate-800 pl-6">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <time className="text-sm text-slate-500">{entry.date}</time>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${tagStyles[entry.tag]}`}
                >
                  {entry.tag}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">{entry.title}</h2>
              <ul className="space-y-2 text-slate-300 list-disc list-inside">
                {entry.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
