import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/api/client'
import { StatusBadge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import LeaveCommentThread from '@/components/LeaveCommentThread'
import ApproverNote from '@/components/ApproverNote'
import type { ApiResponse, LeaveResponse } from '@/types'
import { Clock, MessageSquare } from 'lucide-react'

export default function AdminLeaves() {
  const { user } = useAuth()
  const [leaves, setLeaves] = useState<LeaveResponse[]>([])
  const [filter, setFilter] = useState('ALL')
  const [openThread, setOpenThread] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ApiResponse<LeaveResponse[]>>('/admin/leaves')
      .then((res) => setLeaves(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'ALL' ? leaves : leaves.filter((l) => l.status === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading leaves...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">All Leaves</h1>
          <p className="text-sm text-muted-foreground mt-1">Every leave request across the organization, with discussions</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === s ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-purple-500/40 to-cyan-500/40" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leave Requests</CardTitle>
            <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {filtered.length} shown
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No leave requests found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((leave) => (
                <div key={leave.id} className="rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors overflow-hidden">
                  <button
                    className="flex w-full items-start justify-between gap-3 p-4 text-left"
                    onClick={() => setOpenThread(openThread === leave.id ? null : leave.id)}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground truncate">{leave.employeeName} &middot; {leave.leaveType}</p>
                      <p className="text-xs text-muted-foreground">
                        {leave.reason}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {leave.startDate} to {leave.endDate}
                      </p>
                      <ApproverNote leave={leave} />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {leave.comments?.length ?? 0}
                      </span>
                      <StatusBadge status={leave.status} />
                    </div>
                  </button>
                  {openThread === leave.id && (
                    <div className="px-4 pb-4 border-t border-border/50 pt-3">
                      <LeaveCommentThread leaveId={leave.id} initialComments={leave.comments} currentUserId={user?.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
