import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"

const nextConfig: NextConfig = {}

// Wrap with Sentry only when a DSN is configured. Without a DSN,
// withSentryConfig still injects build-time tooling that talks to
// sentry.io for source-map upload — skipping it keeps local + preview
// builds fast.
export default process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      silent: !process.env.CI,
      widenClientFileUpload: true,
      disableLogger: true,
      sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
    })
  : nextConfig
