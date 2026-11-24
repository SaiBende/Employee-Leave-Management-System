import { useState } from 'react'
import {
  AlertCircle, Ban, Building2, CheckCircle2, Copy, Eye, EyeOff, Lock, Mail, Plus,
  Power, Search, User, Users, X,
} from 'lucide-react'
import {
  useCompanies, useCreateCompany, useUpdateCompanyStatus,
} from '@/hooks/use-platform'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Credentials {
  companyName: string
  adminEmail: string
  adminPassword: string
}

const emptyForm = {
  companyName: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
}

export default function PlatformCompanies() {
  const { data, isLoading } = useCompanies()
  const createCompany = useCreateCompany()
  const updateStatus = useUpdateCompanyStatus()
  const companies = data?.data ?? []

  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [credentials, setCredentials] = useState<Credentials | null>(null)

  const filtered = companies.filter((company) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return (
      company.name.toLowerCase().includes(term) ||
      company.slug.toLowerCase().includes(term) ||
      (company.adminEmail ?? '').toLowerCase().includes(term)
    )
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.adminPassword.length < 8) {
      setError('Temporary password must be at least 8 characters')
      return
    }

    try {
      const res = await createCompany.mutateAsync(form)
      setCredentials({
        companyName: res.data.name,
        adminEmail: res.data.adminEmail ?? form.adminEmail,
        adminPassword: form.adminPassword,
      })
      setForm(emptyForm)
      setShowCreate(false)
      setShowPassword(false)
      toast.success('Company created successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create company')
    }
  }

  const handleToggle = async (id: number, name: string, active: boolean) => {
    const action = active ? 'suspend' : 'activate'
    if (!confirm(`Are you sure you want to ${action} ${name}?`)) return
    try {
      await updateStatus.mutateAsync({ id, active: !active })
      toast.success(`Company ${active ? 'suspended' : 'activated'}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to ${action} company`)
    }
  }

  const copyCredentials = async () => {
    if (!credentials) return
    const text = [
      `Company: ${credentials.companyName}`,
      `Admin email: ${credentials.adminEmail}`,
      `Temporary password: ${credentials.adminPassword}`,
      '',
      'Sign in at /admin/login and change the password when prompted.',
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Credentials copied')
    } catch {
      toast.error('Could not copy credentials')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Companies</h1>
          <p className="text-muted-foreground mt-1">
            Create, monitor, suspend, and activate company tenants
          </p>
        </div>
        <Button onClick={() => { setShowCreate((value) => !value); setError('') }}>
          {showCreate ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showCreate ? 'Close form' : 'New company'}
        </Button>
      </div>

      {credentials && (
        <Card className="border border-emerald-200 shadow-md overflow-hidden bg-emerald-50/60">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-emerald-900">
                    {credentials.companyName} created
                  </p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Share these credentials securely. The temporary password is shown only now.
                  </p>
                  <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-white/70 border border-emerald-200 px-3 py-2">
                      <span className="text-emerald-700 font-medium">Admin email</span>
                      <p className="font-semibold text-emerald-950 break-all">{credentials.adminEmail}</p>
                    </div>
                    <div className="rounded-lg bg-white/70 border border-emerald-200 px-3 py-2">
                      <span className="text-emerald-700 font-medium">Temporary password</span>
                      <p className="font-semibold text-emerald-950 break-all">{credentials.adminPassword}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-2">
                    The admin will be asked to change this password on first sign-in.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={copyCredentials}>
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setCredentials(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showCreate && (
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500" />
          <CardHeader>
            <CardTitle>Create a company</CardTitle>
            <p className="text-sm text-muted-foreground">
              The admin account receives a temporary password and must change it on first login.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-5">
              {error && (
                <div className="flex items-start gap-3 p-4 text-sm text-destructive bg-destructive/5 rounded-xl border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
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
                  <label className="text-sm font-medium text-foreground">Admin Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={form.adminName}
                      onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                      placeholder="Jane Smith"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      className="pl-10"
                      value={form.adminEmail}
                      onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                      placeholder="admin@acme.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Temporary Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      className="pl-10 pr-10"
                      value={form.adminPassword}
                      onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                      placeholder="At least 8 characters"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={createCompany.isPending}>
                  {createCompany.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <><Plus className="h-4 w-4 mr-1" /> Create company</>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500" />
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle>All companies</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search companies..."
                  className="pl-9 h-9 w-full sm:w-64"
                />
              </div>
              <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full whitespace-nowrap">
                {filtered.length} / {companies.length}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {companies.length === 0 ? 'No companies yet' : 'No companies match your search'}
              </p>
              {companies.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Create one above or share the public company signup page.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((company) => (
                <div
                  key={company.id}
                  className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground truncate">{company.name}</p>
                        <Badge variant={company.active ? 'success' : 'destructive'}>
                          {company.active ? 'Active' : 'Suspended'}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground bg-background border border-border/60 rounded px-1.5 py-0.5">
                          {company.slug}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 break-all">
                        {company.adminName ?? 'No admin'} &middot; {company.adminEmail ?? 'No admin email'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {company.employeeCount} users</span>
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {company.departmentCount} departments</span>
                        <span>Created {new Date(company.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updateStatus.isPending}
                      onClick={() => handleToggle(company.id, company.name, company.active)}
                      className={company.active ? 'text-amber-700 border-amber-300 hover:bg-amber-50' : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'}
                    >
                      {company.active ? (
                        <><Ban className="h-3.5 w-3.5 mr-1" /> Suspend</>
                      ) : (
                        <><Power className="h-3.5 w-3.5 mr-1" /> Activate</>
                      )}
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
