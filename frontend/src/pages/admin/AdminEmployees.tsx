import { useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Mail, Building2, Shield, Trash2, UserCog } from 'lucide-react'
import { useAdminEmployees, queryKeys } from '@/hooks/use-leaves'
import { api } from '@/api/client'
import { toast } from 'sonner'

export default function AdminEmployees() {
  const { data: res, isLoading } = useAdminEmployees()
  const employees = res?.data ?? []
  const queryClient = useQueryClient()

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) return
    try {
      await api.delete(`/employees/${id}`)
      queryClient.invalidateQueries({ queryKey: queryKeys.adminEmployees })
      toast.success('Employee deleted successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const managers = employees.filter((e) => e.role === 'MANAGER')
  const getReport = (managerId: number) => employees.filter((e) => e.managerId === managerId)
  const unassigned = employees.filter((e) => e.role === 'EMPLOYEE' && !e.managerId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading employees...</p>
        </div>
      </div>
    )
  }

  const EmployeeRow = ({ emp, isManager }: { emp: typeof employees[0]; isManager?: boolean }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all">
      <div className="flex items-center gap-4">
        <div className={isManager ? "h-10 w-10 rounded-full bg-purple-500/20 border border-purple-300 flex items-center justify-center text-purple-700 font-semibold shadow-sm" : "h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold shadow-md"}>
          {emp.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            {emp.name}
            {isManager && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-purple-100 text-purple-700"><UserCog className="h-3 w-3" /> Manager</span>}
          </p>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {emp.email}</span>
            <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {emp.department}</span>
            {emp.managerName && <span className="flex items-center gap-1"><UserCog className="h-3 w-3" /> Reports to: {emp.managerName}</span>}
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> {emp.role}</span>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(emp.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Manage Employees</h1>
        <p className="text-sm text-muted-foreground mt-1">View all managers, their team members, and who reports to whom</p>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-400/40 via-orange-500/40 to-red-500/40" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Managers & Teams</CardTitle>
            <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {employees.length} employees &middot; {managers.length} managers
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {managers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No employees found</p>
            </div>
          ) : (
            <div className="space-y-5">
              {managers.map((mgr) => {
                const reports = getReport(mgr.id)
                return (
                  <div key={mgr.id} className="space-y-2">
                    <EmployeeRow emp={mgr} isManager />
                    {reports.length > 0 && (
                      <div className="ml-8 space-y-2 border-l-2 border-border/60 pl-4">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                          Team ({reports.length})
                        </p>
                        {reports.map((r) => <EmployeeRow key={r.id} emp={r} />)}
                      </div>
                    )}
                  </div>
                )
              })}

              {unassigned.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Employees without manager ({unassigned.length})
                  </p>
                  <div className="space-y-2">
                    {unassigned.map((e) => <EmployeeRow key={e.id} emp={e} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
