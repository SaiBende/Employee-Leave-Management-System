import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { UserPlus, AlertCircle, CheckCircle2, Mail, Lock, User, Shield } from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ADMIN' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get<{ needsSetup: boolean }>('/auth/setup')
      .then((res) => setNeedsSetup(res.needsSetup))
      .catch(() => setNeedsSetup(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      setSuccess('Admin account created. Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  if (needsSetup === null) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!needsSetup) {
    return (
      <Card className="border-0 shadow-2xl shadow-primary/10 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/60" />
        <CardHeader className="text-center pt-8 pb-6">
          <div className="mx-auto mb-4 p-3 rounded-2xl bg-secondary w-fit">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Registration is closed</CardTitle>
          <CardDescription className="text-sm">
            Accounts are created by your administrator or manager.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 px-8 space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Need access? Contact your company administrator and they will create an
            account for you.
          </p>
          <Button className="w-full" size="lg" onClick={() => navigate('/login')}>
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-2xl shadow-primary/10 overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/60" />
      <CardHeader className="text-center pt-8 pb-6">
        <div className="mx-auto mb-4 p-3 rounded-2xl bg-gradient-primary shadow-lg shadow-primary/30 w-fit">
          <UserPlus className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">Create admin account</CardTitle>
        <CardDescription className="text-sm">
          First-time setup for your company
        </CardDescription>
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          <Shield className="h-4 w-4" />
          This account will be the system administrator
        </div>
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
                autoComplete="name"
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
                autoComplete="email"
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
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Creating admin account...
              </span>
            ) : (
              'Create Admin Account'
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
