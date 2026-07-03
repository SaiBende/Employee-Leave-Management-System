import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { ApiResponse, LeaveResponse } from '@/types'
import { CheckCircle2, XCircle, MessageSquare, Clock } from 'lucide-react'

export default function PendingApprovals() {
  const [leaves, setLeaves] = useState<LeaveResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [commentInput, setCommentInput] = useState<Record<number, string>>({})

  const fetchPending = () => {
    api.get<ApiResponse<LeaveResponse[]>>('/manager/pending-leaves')
      .then((res) => setLeaves(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPending() }, [])

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/manager/leaves/${id}/approve`)
      setLeaves((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve')
    }
  }

  const handleReject = async (id: number) => {
    const comments = commentInput[id] || ''
    try {
      await api.put(`/manager/leaves/${id}/reject`, { comments })
      setLeaves((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading approvals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Pending Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and respond to leave requests from your team</p>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-500/40 via-orange-500/40 to-red-500/40" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Requests</CardTitle>
            <span className="text-xs text-muted-foreground bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {leaves.length} pending
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {leaves.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-500/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">No pending leave requests to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaves.map((leave) => (
                <div key={leave.id} className="p-5 rounded-xl border border-border/50 bg-secondary/20 space-y-4 hover:border-primary/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-sm">
                        {leave.employeeName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{leave.employeeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {leave.leaveType} &middot; {leave.startDate} to {leave.endDate}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={leave.status} />
                  </div>

                  <div className="p-3 rounded-lg bg-background border border-border/30">
                    <p className="text-sm text-foreground leading-relaxed">{leave.reason}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-all hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Add a comment (optional)..."
                      value={commentInput[leave.id] || ''}
                      onChange={(e) => setCommentInput({ ...commentInput, [leave.id]: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="success" onClick={() => handleApprove(leave.id)} className="flex-1">
                      <CheckCircle2 className="h-4 w-4" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(leave.id)} className="flex-1">
                      <XCircle className="h-4 w-4" /> Reject
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
