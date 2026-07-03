import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import type { ApiResponse, LeaveResponse } from '@/types'
import { CalendarPlus, AlertCircle, CheckCircle2, ArrowLeft, CalendarDays, MessageSquare } from 'lucide-react'

const leaveTypes = ['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'OTHER']

export default function ApplyLeave() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await api.post<ApiResponse<LeaveResponse>>('/leaves', {
        ...form,
        startDate: form.startDate,
        endDate: form.endDate,
      })
      setSuccess('Leave applied successfully!')
      setTimeout(() => navigate('/employee/leaves'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply leave')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Apply for Leave</h1>
          <p className="text-sm text-muted-foreground">Fill in the details for your leave request</p>
        </div>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-purple-500/40 to-cyan-500/40" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-primary shadow-md">
              <CalendarPlus className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>New Leave Request</CardTitle>
              <CardDescription>Complete the form below to submit your request</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                  <Input
                    type="date"
                    className="pl-10"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">End Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-10"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    min={form.startDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Reason</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 pl-10 text-sm shadow-sm transition-all duration-200 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring placeholder:text-muted-foreground/60"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Brief description of your leave reason..."
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" size="xl" className="flex-1" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Leave Request'
                )}
              </Button>
              <Button type="button" variant="outline" size="xl" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
