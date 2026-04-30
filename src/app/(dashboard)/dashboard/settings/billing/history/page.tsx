import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, ArrowUpRight, ArrowDownRight, Gift, RotateCcw } from "lucide-react"
import Link from "next/link"

const typeIcons: Record<string, typeof ArrowUpRight> = {
  purchase: ArrowDownRight,
  usage: ArrowUpRight,
  refund: RotateCcw,
  bonus: Gift,
  trial: Gift,
}

const typeColors: Record<string, string> = {
  purchase: "bg-emerald-500/10 text-emerald-500",
  usage: "bg-amber-500/10 text-amber-500",
  refund: "bg-blue-500/10 text-blue-500",
  bonus: "bg-violet-500/10 text-violet-500",
  trial: "bg-sky-500/10 text-sky-500",
}

export default async function BillingHistoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/sign-in")
  }

  // Fetch transactions
  const { data: transactions } = await (supabase
    .from("credit_transactions") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  // Fetch current balance
  const { data: profile } = await (supabase
    .from("users") as any)
    .select("credits_balance")
    .eq("id", user.id)
    .single()

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/settings/billing">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Billing History</h1>
          <p className="text-sm text-muted-foreground">
            View your credit transactions and usage
          </p>
        </div>
      </div>

      {/* Balance card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
          <CardDescription>Your available credits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{profile?.credits_balance ?? 0}</div>
          <p className="text-sm text-muted-foreground mt-1">credits</p>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {transactions?.length ?? 0} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx: any) => {
                const Icon = typeIcons[tx.type] ?? ArrowUpRight
                const color = typeColors[tx.type] ?? "bg-gray-500/10 text-gray-500"
                const isPositive = tx.amount > 0

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.description || `${tx.type} — ${tx.amount > 0 ? '+' : ''}${tx.amount} credits`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tx.type === "purchase" && tx.stripe_payment_id && (
                        <Badge variant="secondary" className="text-xs">
                          Paid
                        </Badge>
                      )}
                      <Badge
                        variant={tx.type === "usage" ? "outline" : "secondary"}
                        className={isPositive ? "text-emerald-600" : ""}
                      >
                        {isPositive ? "+" : ""}{tx.amount}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Credits will appear here when you purchase or use them
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export as CSV
        </Button>
      </div>
    </div>
  )
}