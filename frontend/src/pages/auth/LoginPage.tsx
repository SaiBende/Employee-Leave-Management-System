import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { LogIn, AlertCircle, Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  if (user) {
    const target = user.role === 'MANAGER' ? '/manager/dashboard' : '/employee/dashboard'
    navigate(target, { replace: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login({ email, password })
      const stored = localStorage.getItem('user')
      const u = stored ? JSON.parse(stored) : null
      navigate(u?.role === 'MANAGER' ? '/manager/dashboard' : '/employee/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-2xl shadow-primary/10 overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-purple-500 to-cyan-500" />
      <CardHeader className="text-center pt-8 pb-6">
        <div className="mx-auto mb-4 p-3 rounded-2xl bg-gradient-primary shadow-lg shadow-primary/30 w-fit">
          <LogIn className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription className="text-sm">Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent className="pb-8 px-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-3 p-4 text-sm text-destructive bg-destructive/5 rounded-xl border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" size="xl" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:text-primary/80 transition-colors">
              Create one
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
