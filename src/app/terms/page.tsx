import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 inline-block">
          ← Back to CreateFlow
        </Link>

        <h1 className="text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using CreateFlow (the "Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              CreateFlow is an AI-powered platform that enables users to generate images, videos, music, and written content, and to manage, schedule, and publish that content across various platforms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Accounts</h2>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside">
              <li>You must be at least 18 years old to create an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>You may cancel your account at any time by contacting us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">You may NOT use the Service to generate or distribute content that:</p>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside">
              <li>Is illegal, defamatory, or violates someone's privacy or intellectual property rights</li>
              <li>Contains hate speech, harassment, or discrimination</li>
              <li>Is designed to deceive or defraud</li>
              <li>Violates applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. AI-Generated Content</h2>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside">
              <li>You retain ownership of content you create using the Service.</li>
              <li>You are solely responsible for ensuring your generated content does not infringe on third-party rights.</li>
              <li>AI-generated content may contain inaccuracies. Always review before publishing.</li>
              <li>We reserve the right to monitor content for policy violations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Credits &amp; Payments</h2>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside">
              <li>Credits are consumed when you use AI generation features.</li>
              <li>Unused credits do not roll over between billing cycles for subscriptions.</li>
              <li>One-time credit purchases are non-refundable.</li>
              <li>Subscription cancellations take effect at the end of the current billing period.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive to maintain high availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the Service at any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, CreateFlow and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, contact us at <a href="mailto:hello@thearmansheikh.co" className="text-purple-400 hover:underline">hello@thearmansheikh.co</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
