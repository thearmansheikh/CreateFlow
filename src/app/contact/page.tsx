import Link from "next/link"
import type { Metadata } from "next"
import { Mail, MessageSquare, AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact — CreateFlow",
  description: "Get in touch with the CreateFlow team for support, sales, or feedback.",
}

const channels = [
  {
    title: "General & Support",
    description: "Questions, account issues, feature requests.",
    email: "hello@thearmansheikh.co",
    icon: MessageSquare,
    subject: "CreateFlow — Support",
  },
  {
    title: "Sales / Business plan",
    description: "Custom pricing, team plans, white-label, API access.",
    email: "hello@thearmansheikh.co",
    icon: Mail,
    subject: "CreateFlow — Business Plan Inquiry",
  },
  {
    title: "Security",
    description: "Found a vulnerability? We'd love to hear about it responsibly.",
    email: "hello@thearmansheikh.co",
    icon: AlertCircle,
    subject: "CreateFlow — Security Report",
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-purple-400 hover:text-purple-300 mb-8 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">Contact</h1>
        <p className="text-slate-400 mb-10">
          We read every email. Pick the channel that fits — we&rsquo;ll usually get back within one business day.
        </p>

        <div className="grid gap-4">
          {channels.map((c) => (
            <a
              key={c.title}
              href={`mailto:${c.email}?subject=${encodeURIComponent(c.subject)}`}
              className="group flex gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-purple-500/50 hover:bg-slate-900"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 text-white">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">{c.title}</h2>
                <p className="text-sm text-slate-400">{c.description}</p>
                <p className="mt-2 text-sm font-mono text-purple-300 group-hover:text-purple-200">{c.email}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/30 p-6 text-sm text-slate-400">
          <p>
            Already a CreateFlow user? You can also message us from inside the app —
            we&rsquo;ll have your account context immediately.
          </p>
        </div>
      </div>
    </div>
  )
}
