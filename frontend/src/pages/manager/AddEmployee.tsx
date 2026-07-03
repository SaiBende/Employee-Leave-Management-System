import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { UserPlus, AlertCircle, CheckCircle2, Mail, Lock, User, Building2, ArrowLeft } from 'lucide-react'
import type { ApiResponse } from '@/types'

interface Dept {
  id: number
  name: string
}

export default function AddEmployee() {
  const navigate = useNavigate()
  const [departments, setDepartments] = useState<Dept[]>([])
  const [form, setForm] = useState({ name: '', email: '', password: '', departmentId: 0, role: 'EMPLOYEE' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get<ApiResponse<Dept[]>>('/departments')
      .then((res) => setDepartments(res.data))
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.post('/employees', form)
      setSuccess('Employee added successfully!')
      setTimeout(() => navigate('/manager/employees'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add employee')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Add Employee</h1>
          <p className="text-sm text-muted-foreground">Create a new employee account</p>
        </div>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-purple-500/40 to-cyan-500/40" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-primary shadow-md">
              <UserPlus className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>New Employee</CardTitle>
              <CardDescription>Fill in the details to create an employee account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-4 text-sm text-destructive bg-destructive/5 rounded-xl border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-3 p-4 text-sm text-green-700 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-10" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" className="pl-10" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="employee@company.com" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="password" className="pl-10" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Department</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Select className="pl-10" value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: Number(e.target.value) })} required>
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role</label>
                <Select value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" size="xl" className="flex-1" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Adding...
                  </span>
                ) : 'Add Employee'}
              </Button>
              <Button type="button" variant="outline" size="xl" onClick={() => navigate('/manager/employees')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
