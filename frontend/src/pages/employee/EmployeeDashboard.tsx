import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { DashboardData, ApiResponse, LeaveBalance } from '@/types'
import { CalendarCheck, Clock, XCircle, FileText, TrendingUp, Coins } from 'lucide-react'

export default function EmployeeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<DashboardData>>('/dashboard/employee'),
      api.get<ApiResponse<LeaveBalance[]>>('/leave-balances/me'),
    ])
      .then(([dash, bal]) => {
        setData(dash.data)
        setBalances(bal.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = [
    { title: 'Total Requests', value: data?.totalLeaves ?? 0, icon: FileText, variant: 'primary' as const },
    { title: 'Approved', value: data?.approvedLeaves ?? 0, icon: CalendarCheck, variant: 'success' as const },
    { title: 'Pending', value: data?.pendingLeaves ?? 0, icon: Clock, variant: 'warning' as const },
    { title: 'Rejected', value: data?.rejectedLeaves ?? 0, icon: XCircle, variant: 'danger' as const },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your leave activities</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-sm text-primary font-medium">
          <TrendingUp className="h-4 w-4" />
          Active
        </div>
      </div>

      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {balances.length > 0 && (
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400/40 via-teal-500/40 to-cyan-500/40" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <Coins className="h-5 w-5 text-emerald-600" />
              </div>
              <CardTitle>Leave Balances</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              {balances.map((b) => (
                <div key={b.leaveType} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{b.leaveType}</p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">{b.remainingDays}</span>
                    <span className="text-sm text-muted-foreground">/ {b.totalDays} days left</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all"
                      style={{ width: `${(b.usedDays / b.totalDays) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{b.usedDays} used</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-purple-500/40 to-cyan-500/40" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activities</CardTitle>
            {data?.recentActivities && data.recentActivities.length > 0 && (
              <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                Latest {data.recentActivities.length}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {data?.recentActivities?.length ? (
            <div className="space-y-3">
              {data.recentActivities.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors group">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{leave.reason}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {leave.leaveType} &middot; {leave.startDate} to {leave.endDate}
                    </p>
                  </div>
                  <StatusBadge status={leave.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No leave requests yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Apply for your first leave to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
