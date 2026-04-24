import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 inline-block">
          ← Back to CreateFlow
        </Link>

        <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              CreateFlow ("we," "our," or "us") operates the AI-powered content creation platform. This Privacy Policy explains how we collect, use, and share information when you use our services at createflow-md.vercel.app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We collect the following types of information:</p>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside">
              <li><strong>Account Information:</strong> Name, email address, and profile data when you sign up.</li>
              <li><strong>Usage Data:</strong> Content you generate (images, videos, music, copy), prompts you submit, and how you interact with the platform.</li>
              <li><strong>Payment Information:</strong> Processed through Stripe. We do not store card numbers on our servers.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies for authentication and analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside">
              <li>Provide and maintain the CreateFlow service</li>
              <li>Process payments and manage your subscription</li>
              <li>Improve our AI generation models and user experience</li>
              <li>Send service-related communications (updates, security alerts)</li>
              <li>Enforce our Terms of Service and prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We do not sell your personal information. We share data only with:</p>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside">
              <li><strong>AI Providers:</strong> Replicate, FAL.ai, MiniMax, and Anthropic process your prompts and content to generate outputs. They are bound by their own privacy policies.</li>
              <li><strong>Stripe:</strong> Processes payments securely.</li>
              <li><strong>Supabase:</strong> Hosts our database and user authentication.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside">
              <li>Access, correct, or delete your personal data</li>
              <li>Export your data in a machine-readable format</li>
              <li>Opt out of marketing communications</li>
              <li>Close your account at any time</li>
            </ul>
            <p className="text-muted-foreground mt-3 leading-relaxed">To exercise any of these rights, contact us at <a href="mailto:hello@thearmansheikh.co" className="text-purple-400 hover:underline">hello@thearmansheikh.co</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your data as long as your account is active. If you delete your account, your personal data will be removed within 30 days, except where we are legally required to retain it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use industry-standard security measures including HTTPS encryption, secure database access via Supabase, and serverless architecture to protect your data. However, no system is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about this Privacy Policy, contact us at <a href="mailto:hello@thearmansheikh.co" className="text-purple-400 hover:underline">hello@thearmansheikh.co</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
