import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-purple-400 hover:text-purple-300 mb-8 inline-block"
        >
          ← Back to home
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-slate-500 mb-8">Last updated: 24 April 2025</p>

        <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
          <p>
            By using CreateFlow, you agree to these Terms of Service. Please read them carefully.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Account</h2>
            <p>You must create an account to use our services. You are responsible for maintaining the security of your account and for all activities that occur under it.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Acceptable Use</h2>
            <p>You may not:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use the platform for any illegal purpose</li>
              <li>Upload or generate content that violates intellectual property rights</li>
              <li>Attempt to gain unauthorised access to our systems</li>
              <li>Use the service to generate harmful, abusive, or malicious content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Content</h2>
            <p>You retain ownership of content you create. By using our AI generation features, you grant us a licence to process and store your content as necessary to provide our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Payment &amp; Credits</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Credits are non-refundable and do not expire unless otherwise stated</li>
              <li>Subscription fees are billed in advance on a monthly or annual basis</li>
              <li>We reserve the right to modify pricing with 30 days' notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Limitation of Liability</h2>
            <p>CreateFlow is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Termination</h2>
            <p>We may suspend or terminate your account if you violate these terms. You may delete your account at any time through your account settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Changes</h2>
            <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>For questions about these terms, contact us at: <span className="text-purple-400">legal@thearmansheikh.co</span></p>
          </section>
        </div>
      </div>
    </div>
  )
}
