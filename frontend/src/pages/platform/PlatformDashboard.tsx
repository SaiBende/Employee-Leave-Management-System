import { Link } from 'react-router-dom'
import {
  ArrowRight, Building2, CalendarCheck, CheckCircle2, Plus, Users,
} from 'lucide-react'
import { useCompanies, usePlatformDashboard } from '@/hooks/use-platform'
import { StatCard } from '@/components/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function PlatformDashboard() {
  const { data: dashboardRes, isLoading: dashboardLoading } = usePlatformDashboard()
  const { data: companiesRes, isLoading: companiesLoading } = useCompanies()

  const dashboard = dashboardRes?.data
  const companies = companiesRes?.data ?? []
  const recentCompanies = companies.slice(0, 5)

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading platform overview...</p>
        </div>
      </div>
    )
  }

  const stats = [
    { title: 'Companies', value: dashboard?.totalCompanies ?? 0, icon: Building2, variant: 'primary' as const },
    { title: 'Active Companies', value: dashboard?.activeCompanies ?? 0, icon: CheckCircle2, variant: 'success' as const },
    { title: 'Company Users', value: dashboard?.totalEmployees ?? 0, icon: Users, variant: 'primary' as const },
    { title: 'Leave Requests', value: dashboard?.totalLeaves ?? 0, icon: CalendarCheck, variant: 'warning' as const },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Platform Overview</h1>
          <p className="text-muted-foreground mt-1">Every company on the platform, in one console</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-slate-900 text-white hover:bg-slate-900">Super Admin</Badge>
          <Link to="/platform/companies">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Manage companies
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-md overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent companies</CardTitle>
              <Link to="/platform/companies" className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {companiesLoading ? (
              <div className="flex justify-center py-10">
                <div className="h-7 w-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : recentCompanies.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No companies yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Share the public company signup page or create one from the console.
                </p>
                <Link to="/platform/companies" className="inline-block mt-4">
                  <Button size="sm" variant="outline">Create the first company</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCompanies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border border-border/50">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate flex items-center gap-2">
                        {company.name}
                        <Badge variant={company.active ? 'success' : 'secondary'}>
                          {company.active ? 'Active' : 'Suspended'}
                        </Badge>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {company.adminEmail ?? 'No admin email'} &middot; {company.employeeCount} users &middot; {company.departmentCount} departments
                      </p>
                    </div>
                    <Link to="/platform/companies" className="text-xs font-semibold text-primary shrink-0 ml-4">
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-primary/20 to-primary/10" />
          <CardHeader>
            <CardTitle>Platform checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <p className="text-muted-foreground">Platform super admin is configured.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <p className="text-muted-foreground">Company signup creates an isolated tenant with default departments.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <p className="text-muted-foreground">Suspending a company immediately blocks its users.</p>
            </div>
            <div className="pt-2 border-t border-border/60">
              <p className="text-xs text-muted-foreground">
                Billing and subscriptions are planned for the next phase.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
