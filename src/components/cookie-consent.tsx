"use client"

import { useState, useEffect } from "react"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent")
    if (!consent) {
      // Small delay so it doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  if (!visible) return null

  function handleAccept(essentialOnly = false) {
    localStorage.setItem(
      "cookie_consent",
      JSON.stringify({
        accepted: true,
        essentialOnly,
        timestamp: new Date().toISOString(),
      })
    )
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#111111]/95 backdrop-blur-xl shadow-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <h3 className="text-base font-semibold mb-1">We use cookies</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use essential cookies to make the site work and optional analytics cookies to
              understand how you use CreateFlow so we can improve it. You can accept all or stick
              to essentials.{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Learn more
              </a>
              .
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 justify-end">
          <button
            onClick={() => handleAccept(true)}
            className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-foreground hover:bg-white/[0.06] transition-colors"
          >
            Essentials only
          </button>
          <button
            onClick={() => handleAccept(false)}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 px-5 py-2 text-sm font-semibold text-white hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
