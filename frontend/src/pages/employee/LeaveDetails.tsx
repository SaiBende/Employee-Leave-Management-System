import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { ApiResponse, LeaveResponse } from '@/types'
import { ArrowLeft, Edit, Trash2, CalendarDays, MessageSquare, Clock, FileText } from 'lucide-react'

export default function LeaveDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [leave, setLeave] = useState<LeaveResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ApiResponse<LeaveResponse>>(`/leaves/${id}`)
      .then((res) => setLeave(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this leave request?')) return
    try {
      await api.delete(`/leaves/${id}`)
      navigate('/employee/leaves')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel')
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

  if (!leave) {
    return (
      <div className="text-center py-16">
        <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground">Leave not found</p>
        <p className="text-sm text-muted-foreground mt-1">This leave request doesn't exist</p>
        <Button variant="outline" onClick={() => navigate('/employee/leaves')} className="mt-6">
          Back to History
        </Button>
      </div>
    )
  }

  const details = [
    { label: 'Leave Type', value: leave.leaveType, icon: CalendarDays },
    { label: 'Duration', value: `${leave.startDate} to ${leave.endDate}`, icon: CalendarDays },
    { label: 'Applied On', value: new Date(leave.createdAt).toLocaleDateString(), icon: Clock },
    { label: 'Last Updated', value: new Date(leave.updatedAt).toLocaleDateString(), icon: Clock },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Leave Details</h1>
          <p className="text-sm text-muted-foreground">Request #{leave.id}</p>
        </div>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-purple-500/40 to-cyan-500/40" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Request Information</CardTitle>
            <StatusBadge status={leave.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {details.map((d) => {
              const Icon = d.icon
              return (
                <div key={d.label} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{d.label}</p>
                    <p className="text-sm font-medium text-foreground">{d.value}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reason</p>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
              <p className="text-sm text-foreground leading-relaxed">{leave.reason}</p>
            </div>
          </div>

          {leave.managerComments && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Manager Comments</p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <MessageSquare className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800">{leave.managerComments}</p>
              </div>
            </div>
          )}

          {leave.status === 'PENDING' && (
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => navigate(`/employee/leaves/${id}/edit`)}>
                <Edit className="h-4 w-4" /> Edit Request
              </Button>
              <Button variant="destructive" onClick={handleCancel}>
                <Trash2 className="h-4 w-4" /> Cancel Request
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
