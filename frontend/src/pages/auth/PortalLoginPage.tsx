import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ApiError } from '@/api/client'
import { roleHome } from '@/lib/role-home'
import { portalById } from '@/lib/portals'
import { useSetupStatus } from '@/hooks/use-setup-status'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Portal } from '@/types'

interface Props {
  portal: Portal
}

interface PortalMismatch {
  role?: string
  portal?: string
}

export default function PortalLoginPage({ portal }: Props) {
  const config = portalById(portal)
  const Icon = config.icon
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const setupStatus = useSetupStatus()

  const initialEmail =
    (location.state as { email?: string } | null)?.email ?? ''
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [alternatePortal, setAlternatePortal] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const needsSetup = portal === 'PLATFORM' && setupStatus.data?.needsSetup === true

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setAlternatePortal(null)
    setLoading(true)

    try {
      const loggedIn = await login({ email, password, portal })
      if (loggedIn.mustChangePassword) {
        navigate('/change-password', { replace: true })
      } else {
        navigate(roleHome(loggedIn.role), { replace: true })
      }
    } catch (err) {
      if (err instanceof ApiError) {
        const mismatch = err.payload?.data as PortalMismatch | undefined
        if (mismatch?.portal) {
          setAlternatePortal(mismatch.portal)
        }
      }
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-0 shadow-2xl shadow-primary/10 overflow-hidden">
        <div className={cn('h-1.5 w-full bg-gradient-to-r', config.accent)} />
        <CardHeader className="text-center pt-8 pb-6">
          <div className={cn('mx-auto mb-4 p-3 rounded-2xl text-white shadow-lg w-fit', config.iconBg)}>
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">{config.title} sign in</CardTitle>
          <CardDescription className="text-sm">
            {config.subtitle} portal
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 px-6 sm:px-8">
          {needsSetup && (
            <div className="mb-5 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-amber-900">
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="text-xs leading-relaxed">
                  <p className="font-semibold text-sm">Platform setup has not been completed.</p>
                  <p className="mt-1 text-amber-700">
                    Create the platform super admin account first.
                  </p>
                  <Link to="/setup" className="inline-flex items-center gap-1 font-semibold mt-2 hover:underline">
                    Start setup <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span>{error}</span>
                    {alternatePortal && (
                      <Link
                        to={alternatePortal}
                        state={{ email }}
                        className="mt-2 flex items-center gap-1 font-semibold hover:underline"
                      >
                        Open the correct portal <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  autoComplete="email"
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
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>Sign in to {config.label}</>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border/60 space-y-3 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> All portals
            </Link>
            <p className="text-xs text-muted-foreground">
              New company?{' '}
              <Link to="/signup" className="text-primary font-semibold hover:text-primary/80">
                Create a company account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
