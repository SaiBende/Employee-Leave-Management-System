import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { ApiResponse, LeaveBalance } from '@/types'
import { Coins, TrendingUp } from 'lucide-react'

export default function MyBalances() {
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ApiResponse<LeaveBalance[]>>('/leave-balances/me')
      .then((res) => setBalances(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading balances...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">My Leave Balances</h1>
        <p className="text-sm text-muted-foreground mt-1">View your available leave days for the current year</p>
      </div>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {balances.map((b) => (
          <div key={b.leaveType} className="p-6 rounded-xl bg-card border border-border/50 shadow-md hover:shadow-lg transition-shadow">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{b.leaveType}</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">{b.remainingDays}</span>
              <span className="text-sm text-muted-foreground">/ {b.totalDays} days</span>
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all"
                style={{ width: `${(b.usedDays / b.totalDays) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{b.usedDays} used this year</p>
          </div>
        ))}
      </div>
    </div>
  )
}