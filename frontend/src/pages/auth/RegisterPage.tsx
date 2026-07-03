import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { UserPlus, AlertCircle, CheckCircle2, Mail, Lock, User, Building2 } from 'lucide-react'

interface Dept {
  id: number
  name: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [departments, setDepartments] = useState<Dept[]>([])
  const [form, setForm] = useState({ name: '', email: '', password: '', departmentId: 0, role: 'MANAGER' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setDepartments([
      { id: 6, name: 'Engineering' },
      { id: 7, name: 'HR' },
      { id: 8, name: 'Marketing' },
      { id: 9, name: 'Finance' },
    ])
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      setSuccess('Registration successful! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-2xl shadow-primary/10 overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-purple-500 to-cyan-500" />
      <CardHeader className="text-center pt-8 pb-6">
        <div className="mx-auto mb-4 p-3 rounded-2xl bg-gradient-primary shadow-lg shadow-primary/30 w-fit">
          <UserPlus className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">Create account</CardTitle>
        <CardDescription className="text-sm">Register as a new manager to get started</CardDescription>
      </CardHeader>
      <CardContent className="pb-8 px-8">
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
              <Input
                className="pl-10"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                className="pl-10"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                className="pl-10"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Department</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Select
                className="pl-10"
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: Number(e.target.value) })}
                required
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
            </div>
          </div>

          <Button type="submit" size="xl" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create account'
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
