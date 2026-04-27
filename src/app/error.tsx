'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
        <p className="text-slate-400 mb-6">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
