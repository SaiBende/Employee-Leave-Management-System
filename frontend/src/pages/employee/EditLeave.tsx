import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import type { ApiResponse, LeaveResponse } from '@/types'
import { AlertCircle, CalendarDays, MessageSquare, ArrowLeft } from 'lucide-react'

const leaveTypes = ['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'OTHER']

export default function EditLeave() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get<ApiResponse<LeaveResponse>>(`/leaves/${id}`)
      .then((res) => {
        const l = res.data
        setForm({ leaveType: l.leaveType, startDate: l.startDate, endDate: l.endDate, reason: l.reason })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.put<ApiResponse<LeaveResponse>>(`/leaves/${id}`, form)
      navigate(`/employee/leaves/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Edit Leave Request</h1>
          <p className="text-sm text-muted-foreground">Update your pending leave request</p>
        </div>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-purple-500/40 to-cyan-500/40" />
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-4 text-sm text-destructive bg-destructive/5 rounded-xl border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Leave Type</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Select
                  className="pl-10"
                  value={form.leaveType}
                  onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                >
                  {leaveTypes.map((t) => (
                    <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Start Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-10" value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">End Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-10" value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Reason</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 pl-10 text-sm shadow-sm transition-all duration-200 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting} size="xl">
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" size="xl" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
