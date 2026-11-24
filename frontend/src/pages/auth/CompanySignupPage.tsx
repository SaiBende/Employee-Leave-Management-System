import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle, ArrowRight, Building2, CheckCircle2, Lock, Mail, Shield, Sparkles, User,
} from 'lucide-react'
import { api } from '@/api/client'
import { useSetupStatus } from '@/hooks/use-setup-status'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ApiResponse, CompanySignupResult } from '@/types'

export default function CompanySignupPage() {
  const setupStatus = useSetupStatus()
  const navigate = useNavigate()
  const [result, setResult] = useState<CompanySignupResult | null>(null)
  const [form, setForm] = useState({
    companyName: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
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
      const res = await api.post<ApiResponse<CompanySignupResult>>('/auth/signup-company', {
        companyName: form.companyName,
        name: form.name,
        email: form.email,
        password: form.password,
      })
      setResult(res.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Company signup failed')
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

  if (setupStatus.data?.needsSetup === true) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-0 shadow-2xl shadow-primary/10 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
          <CardHeader className="text-center pt-8 pb-6">
            <div className="mx-auto mb-4 p-3 rounded-2xl bg-amber-500 text-white shadow-lg w-fit">
              <Shield className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Platform setup required</CardTitle>
            <CardDescription>
              The platform owner must initialize the platform before companies can create accounts.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 px-8 space-y-3">
            <Button className="w-full" size="lg" onClick={() => navigate('/setup')}>
              Complete platform setup <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
              Back to portals
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (result) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-0 shadow-2xl shadow-primary/10 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <CardHeader className="text-center pt-8 pb-6">
            <div className="mx-auto mb-4 p-3 rounded-2xl bg-emerald-500 text-white shadow-lg w-fit">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Company created</CardTitle>
            <CardDescription>
              {result.companyName} is ready. Sign in to the company admin portal and start adding
              your team.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 px-8 space-y-4">
            <div className="rounded-xl border border-border/60 bg-secondary/30 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company admin</p>
              <p className="font-semibold text-foreground mt-1">{result.adminEmail}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Use the password you chose during signup.
              </p>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate('/admin/login', { state: { email: result.adminEmail } })}
            >
              Go to company admin login <ArrowRight className="h-4 w-4 ml-1" />
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
    <div className="max-w-lg mx-auto">
      <Card className="border-0 shadow-2xl shadow-primary/10 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
        <CardHeader className="text-center pt-8 pb-6">
          <div className="mx-auto mb-4 p-3 rounded-2xl bg-amber-500 text-white shadow-lg w-fit">
            <Building2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Create your company</CardTitle>
          <CardDescription className="text-sm">
            Set up a new company workspace and the first company admin account.
          </CardDescription>
          <div className="mt-3 inline-flex items-center justify-center gap-2 text-xs text-primary bg-primary/5 border border-primary/15 rounded-lg px-4 py-2">
            <Sparkles className="h-3.5 w-3.5" />
            Default departments and leave balances are created automatically
          </div>
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
              <label className="text-sm font-medium text-foreground">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="Acme Corporation"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Admin Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Smith"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  className="pl-10"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@acme.com"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
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
                    placeholder="Repeat password"
                    minLength={8}
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating company...
                </span>
              ) : (
                'Create company account'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border/60 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/admin/login" className="text-primary font-semibold hover:text-primary/80">
                Company admin sign in
              </Link>
            </p>
            <Link to="/login" className="inline-block text-xs text-muted-foreground hover:text-foreground">
              Back to all portals
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
