// Browser-side Sentry init. Loaded by @sentry/nextjs on every client render.
// No-op when SENTRY_DSN is unset (e.g. local dev) so the SDK doesn't ship
// errors from someone's laptop into prod telemetry.
import * as Sentry from "@sentry/nextjs"

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    // 10% trace sample is plenty for a launch-tier project; bump later
    // if you need more coverage and your event budget allows.
    tracesSampleRate: 0.1,
    // Keep replays off by default — they significantly inflate event volume.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  })
}
