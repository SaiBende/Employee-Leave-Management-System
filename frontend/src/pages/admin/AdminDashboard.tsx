import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { DashboardData, ApiResponse } from '@/types'
import { Users, Clock, CalendarCheck, XCircle, TrendingUp, Building2 } from 'lucide-react'

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ApiResponse<DashboardData>>('/admin/dashboard')
      .then((res) => setData(res.data))
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
    { title: 'Total Employees', value: data?.totalEmployees ?? 0, icon: Users, variant: 'primary' as const },
    { title: 'Total Leaves', value: data?.totalLeaves ?? 0, icon: CalendarCheck, variant: 'primary' as const },
    { title: 'Pending Approvals', value: data?.pendingApprovals ?? 0, icon: Clock, variant: 'warning' as const },
    { title: 'Approved', value: data?.approvedLeaves ?? 0, icon: CalendarCheck, variant: 'success' as const },
    { title: 'Rejected', value: data?.rejectedLeaves ?? 0, icon: XCircle, variant: 'danger' as const },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Organization-wide overview</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
          <TrendingUp className="h-4 w-4" />
          Admin View
        </div>
      </div>

      <div className="grid gap-5 grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-400/40 via-orange-500/40 to-red-500/40" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Organization Activities</CardTitle>
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
                <div key={leave.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      <span className="font-semibold">{leave.employeeName}</span> - {leave.reason}
                    </p>
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
              <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No activities yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}