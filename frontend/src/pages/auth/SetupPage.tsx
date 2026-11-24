import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Mail, Shield, User } from 'lucide-react'
import { api } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import { useSetupStatus } from '@/hooks/use-setup-status'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ApiResponse, User as UserType } from '@/types'

export default function SetupPage() {
  const setupStatus = useSetupStatus()
  const { establishSession } = useAuth()
  const navigate = useNavigate()
  const [completed, setCompleted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await api.post<ApiResponse<UserType>>('/auth/setup', {
        name: form.name,
        email: form.email,
        password: form.password,
      })
      establishSession(res.data)
      setCompleted(true)
      navigate('/platform/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Platform setup failed')
    } finally {
      setLoading(false)
    }
  }

  if (setupStatus.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (completed || setupStatus.data?.needsSetup === false) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-0 shadow-2xl shadow-primary/10 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <CardHeader className="text-center pt-8 pb-6">
            <div className="mx-auto mb-4 p-3 rounded-2xl bg-emerald-500 text-white shadow-lg w-fit">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Platform setup complete</CardTitle>
            <CardDescription>
              The platform super admin already exists. Companies can sign up from the public page.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 px-8 space-y-3">
            <Button className="w-full" size="lg" onClick={() => navigate('/platform/login')}>
              Go to platform login <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
              Back to all portals
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-0 shadow-2xl shadow-primary/10 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500" />
        <CardHeader className="text-center pt-8 pb-6">
          <div className="mx-auto mb-4 p-3 rounded-2xl bg-slate-900 text-white shadow-lg w-fit">
            <Shield className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Initialize the platform</CardTitle>
          <CardDescription className="text-sm">
            Create the one-time platform super admin account. This is not a company account.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 px-6 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 text-sm text-destructive bg-destructive/5 rounded-xl border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Platform owner"
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
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="owner@yourplatform.com"
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
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  className="pl-10"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Repeat your password"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating platform owner...
                </span>
              ) : (
                'Create platform owner'
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-5">
            Company admins and employees are created separately. This account only manages the
            platform.
          </p>
          <div className="text-center mt-3">
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Back to portals
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
