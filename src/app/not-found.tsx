import Link from "next/link"
import { Sparkles, ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <Link href="/" className="mb-12 flex items-center gap-2 text-2xl font-bold">
        <Sparkles className="h-7 w-7 text-primary" />
        CreateFlow
      </Link>

      <div className="relative">
        <h1 className="text-9xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          404
        </h1>
        <div className="absolute inset-0 text-9xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent blur-2xl opacity-30">
          404
        </div>
      </div>

      <h2 className="mt-8 text-2xl font-semibold tracking-tight">Page not found</h2>
      <p className="mt-3 max-w-md text-lg text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>

      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Link href="/">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </Link>
      </div>

      <p className="mt-12 text-sm text-muted-foreground/60">
        If you think this is a mistake,{' '}
        <a href="mailto:hello@thearmansheikh.co" className="text-primary hover:underline">
          contact us
        </a>
        .
      </p>
    </div>
  )
}
