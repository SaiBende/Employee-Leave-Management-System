import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { StatusBadge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { ApiResponse, LeaveResponse } from '@/types'
import { ArrowLeft, Clock } from 'lucide-react'

export default function EmployeeLeaveHistory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [leaves, setLeaves] = useState<LeaveResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ApiResponse<LeaveResponse[]>>(`/manager/employees/${id}/leaves`)
      .then((res) => setLeaves(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/manager/employees')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Employee Leave History</h1>
          <p className="text-sm text-muted-foreground">View leave requests from your team member</p>
        </div>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-purple-500/40 to-cyan-500/40" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leave Requests</CardTitle>
            <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {leaves.length} total
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {leaves.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No leave requests found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">This employee hasn't submitted any leave requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaves.map((leave) => (
                <div key={leave.id} className="flex items-start justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground truncate">{leave.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {leave.leaveType} &middot; {leave.startDate} to {leave.endDate}
                    </p>
                    {leave.managerComments && (
                      <p className="text-xs text-muted-foreground mt-2 p-2 rounded-lg bg-amber-50 border border-amber-100 italic">
                        Comment: {leave.managerComments}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={leave.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
