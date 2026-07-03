import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ApiResponse, EmployeeResponse } from '@/types'
import { Eye, Users, UserPlus, Building2, Mail } from 'lucide-react'

export default function TeamMembers() {
  const [employees, setEmployees] = useState<EmployeeResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ApiResponse<EmployeeResponse[]>>('/manager/employees')
      .then((res) => setEmployees(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading team...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">My Team</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage your team members</p>
        </div>
        <Link to="/manager/employees/add">
          <Button>
            <UserPlus className="h-4 w-4" /> Add Employee
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-purple-500/40 to-cyan-500/40" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Team Members</CardTitle>
            <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {employees.length} members
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No team members yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Add employees to start managing their leaves</p>
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold shadow-md">
                      {emp.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {emp.email}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> {emp.department}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/manager/employees/${emp.id}/leaves`}>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-4 w-4" /> View Leaves
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
