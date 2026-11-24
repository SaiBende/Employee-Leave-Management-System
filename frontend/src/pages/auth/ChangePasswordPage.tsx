import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, KeyRound, Lock, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { roleHome } from '@/lib/role-home'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ChangePasswordPage() {
  const { user, changePassword } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setLoading(true)
    try {
      await changePassword(form.currentPassword, form.newPassword)
      setSuccess(true)
      setTimeout(() => navigate(roleHome(user?.role), { replace: true }), 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-0 shadow-2xl shadow-primary/10 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/60" />
        <CardHeader className="text-center pt-8 pb-6">
          <div className="mx-auto mb-4 p-3 rounded-2xl bg-gradient-primary text-primary-foreground shadow-lg w-fit">
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Change password</CardTitle>
          <CardDescription>
            Choose a new password for {user?.email ?? 'your account'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 px-6 sm:px-8">
          {user?.mustChangePassword && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-amber-900">
              <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="text-xs leading-relaxed">
                <p className="text-sm font-semibold">You are using a temporary password.</p>
                <p className="mt-1 text-amber-700">
                  Set a new password before continuing to your workspace.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 text-sm text-destructive bg-destructive/5 rounded-xl border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-3 p-4 text-sm text-green-700 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Password updated. Redirecting to your workspace...</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  className="pl-10"
                  autoComplete="current-password"
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  placeholder="Current password"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  className="pl-10"
                  autoComplete="new-password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  className="pl-10"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Repeat new password"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading || success}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Updating password...
                </span>
              ) : (
                'Update password'
              )}
            </Button>
          </form>

          {!user?.mustChangePassword && (
            <div className="mt-5 text-center">
              <Link
                to={roleHome(user?.role)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Back to dashboard
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
