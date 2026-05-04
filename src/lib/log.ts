// Tiny structured logger.
// - logger.debug: dev-only verbose; silenced in production unless DEBUG=1.
// - logger.info: always shown, but should be used sparingly in API routes.
// - logger.error: always shown. Forwarded to Sentry when SENTRY_DSN is set.
import * as Sentry from '@sentry/nextjs'

const isProd = process.env.NODE_ENV === 'production'
const debugEnabled = process.env.DEBUG === '1' || !isProd
const sentryEnabled = Boolean(process.env.SENTRY_DSN)

interface LogFields {
  [key: string]: unknown
}

function format(level: string, msg: string, fields?: LogFields) {
  if (!fields) return `[${level}] ${msg}`
  try {
    return `[${level}] ${msg} ${JSON.stringify(fields)}`
  } catch {
    return `[${level}] ${msg} [unserializable fields]`
  }
}

export const logger = {
  debug(msg: string, fields?: LogFields) {
    if (!debugEnabled) return
    // eslint-disable-next-line no-console
    console.log(format('debug', msg, fields))
  },
  info(msg: string, fields?: LogFields) {
    // eslint-disable-next-line no-console
    console.log(format('info', msg, fields))
  },
  warn(msg: string, fields?: LogFields) {
    // eslint-disable-next-line no-console
    console.warn(format('warn', msg, fields))
  },
  error(msg: string, err?: unknown, fields?: LogFields) {
    const merged: LogFields = { ...fields }
    if (err instanceof Error) {
      merged.error = err.message
      // Stack only in dev — prod stacks should go to Sentry, not stdout.
      if (!isProd) merged.stack = err.stack
    } else if (err !== undefined) {
      merged.error = String(err)
    }
    // eslint-disable-next-line no-console
    console.error(format('error', msg, merged))

    if (sentryEnabled) {
      if (err instanceof Error) {
        Sentry.captureException(err, { extra: { msg, ...fields } })
      } else {
        Sentry.captureMessage(msg, { level: 'error', extra: { ...fields, err } })
      }
    }
  },
}
