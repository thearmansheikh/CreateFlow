"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarIcon } from "lucide-react"

export default function CalendarPage() {
  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Content Calendar</h1>
        <p className="mt-1 text-muted-foreground">Schedule and manage your content across platforms.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Drag-and-drop calendar with multi-platform scheduling, auto-publish, and publish queue will be built in Phase 7.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
