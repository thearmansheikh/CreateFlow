"use client"

export function AnalyticsChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data)
  if (entries.length === 0) return null

  const maxVal = Math.max(...entries.map(([, v]) => v))

  return (
    <div className="flex items-end gap-2 h-40">
      {entries.map(([label, value]) => {
        const heightPct = maxVal > 0 ? (value / maxVal) * 100 : 0
        return (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground">{value}</span>
            <div className="w-full bg-primary/20 rounded-t-md relative overflow-hidden" style={{ height: `${Math.max(heightPct, 5)}%` }}>
              <div className="absolute inset-0 bg-primary" />
            </div>
            <span className="text-[10px] text-muted-foreground truncate w-full text-center">{label}</span>
          </div>
        )
      })}
    </div>
  )
}
