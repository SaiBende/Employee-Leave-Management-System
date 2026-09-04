import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLeave, useEditLeave } from '@/hooks/use-leaves'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { AlertCircle, CalendarDays, MessageSquare, ArrowLeft } from 'lucide-react'

const leaveTypes = ['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'OTHER']

export default function EditLeave() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' })
  const [error, setError] = useState('')
  const { data: leaveRes, isLoading: loading } = useLeave(id ?? '')
  const leave = leaveRes?.data
  const editLeave = useEditLeave()

  useEffect(() => {
    if (leave) {
      setForm({ leaveType: leave.leaveType, startDate: leave.startDate, endDate: leave.endDate, reason: leave.reason })
    }
  }, [leave])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await editLeave.mutateAsync({ id: id ?? '', data: form })
      toast.success('Leave updated successfully')
      navigate(`/employee/leaves/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
      toast.error(err instanceof Error ? err.message : 'Failed to update')
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
                  value={form.leaveType}
                  onValueChange={(val) => setForm({ ...form, leaveType: val })}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
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
              <Button type="submit" disabled={editLeave.isPending} size="lg">
                {editLeave.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
