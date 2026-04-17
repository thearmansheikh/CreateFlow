import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette } from "lucide-react"

export default function BrandsPage() {
  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Brand Kits</h1>
        <p className="mt-1 text-muted-foreground">Manage your brand voices, styles, and assets.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-muted-foreground" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Brand profiles with voice/tone configuration, color palettes, fonts, and AI-aware brand context will be built in Phase 5.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
