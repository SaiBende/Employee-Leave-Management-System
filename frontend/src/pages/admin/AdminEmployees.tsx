import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { ApiResponse, EmployeeResponse, ApiResponse as ApiResp } from '@/types'
import { Users, Mail, Building2, Shield, Trash2, Edit3, X, Check } from 'lucide-react'

export default function AdminEmployees() {
  const [employees, setEmployees] = useState<EmployeeResponse[]>([])
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', departmentId: 0 })

  useEffect(() => {
    Promise.all([
      api.get<ApiResp<EmployeeResponse[]>>('/admin/employees'),
      api.get<ApiResp<{ id: number; name: string }[]>>('/admin/departments'),
    ])
      .then(([empRes, deptRes]) => {
        setEmployees(empRes.data)
        setDepartments(deptRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleEdit = (emp: EmployeeResponse) => {
    setEditForm({ name: emp.name, email: emp.email, role: emp.role, departmentId: 0 })
    setEditingId(emp.id)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) return
    try {
      await api.delete(`/employees/${id}`)
      setEmployees((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading employees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Manage Employees</h1>
        <p className="text-sm text-muted-foreground mt-1">View, edit, and remove all employees</p>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-400/40 via-orange-500/40 to-red-500/40" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Employees</CardTitle>
            <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {employees.length} total
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No employees found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold shadow-md">
                      {emp.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {emp.email}</span>
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {emp.department}</span>
                        <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> {emp.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(emp)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(emp.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}