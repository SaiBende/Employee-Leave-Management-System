import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { ApiResponse, EmployeeResponse } from '@/types'
import { User, Mail, Shield, Building2, Calendar, BadgeCheck } from 'lucide-react'

export default function Profile() {
  const [profile, setProfile] = useState<EmployeeResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ApiResponse<EmployeeResponse>>('/employees/me')
      .then((res) => setProfile(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const details = [
    { label: 'Full Name', value: profile.name, icon: User },
    { label: 'Email Address', value: profile.email, icon: Mail },
    { label: 'Role', value: profile.role.charAt(0) + profile.role.slice(1).toLowerCase(), icon: Shield },
    { label: 'Department', value: profile.department, icon: Building2 },
    { label: 'Manager', value: profile.managerName || 'Not assigned', icon: User },
    { label: 'Member Since', value: new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), icon: Calendar },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Your account information and details</p>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-purple-500/40 to-cyan-500/40" />
        <div className="p-8 pb-0 text-center">
          <div className="inline-flex mb-4">
            <div className="h-24 w-24 rounded-full bg-gradient-primary shadow-xl shadow-primary/30 flex items-center justify-center relative">
              <span className="text-3xl font-bold text-primary-foreground">
                {profile.name?.charAt(0)?.toUpperCase()}
              </span>
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-4 border-card">
                <BadgeCheck className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
      </Card>

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-purple-500/40 to-cyan-500/40" />
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {details.map((d) => {
              const Icon = d.icon
              return (
                <div key={d.label} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{d.label}</p>
                    <p className="text-sm font-medium text-foreground">{d.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
