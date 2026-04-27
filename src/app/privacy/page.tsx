import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-purple-400 hover:text-purple-300 mb-8 inline-block"
        >
          ← Back to home
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-500 mb-8">Last updated: 24 April 2025</p>

        <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
          <p>
            CreateFlow ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our platform.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Information We Collect</h2>
            <h3 className="text-lg font-medium text-white mt-4 mb-2">Information You Provide</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Account information (name, email address) when you register</li>
              <li>Content you create, upload, or store on the platform</li>
              <li>Payment information (processed securely through Stripe)</li>
            </ul>
            <h3 className="text-lg font-medium text-white mt-4 mb-2">Information Collected Automatically</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>Device and browser information</li>
              <li>IP address and approximate location</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Provide and maintain our services</li>
              <li>Process payments and manage your subscription</li>
              <li>Improve and personalise your experience</li>
              <li>Send service-related communications</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Storage</h2>
            <p>Your data is stored on Supabase (PostgreSQL) servers. We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Cookies</h2>
            <p>We use essential cookies for authentication and session management. You can control cookie preferences through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Your Rights</h2>
            <p>You have the right to access your personal data, request correction or deletion, export your data, and withdraw consent at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>For privacy-related inquiries, contact us at: <span className="text-purple-400">privacy@thearmansheikh.co</span></p>
          </section>
        </div>
      </div>
    </div>
  )
}
