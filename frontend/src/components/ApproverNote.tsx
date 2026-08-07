import type { LeaveResponse } from '@/types'
import { UserCheck, UserX, Ban } from 'lucide-react'

export default function ApproverNote({ leave }: { leave: LeaveResponse }) {
  if (leave.status === 'CANCELLED') {
    if (!leave.cancelledByName) return null
    return (
      <p className="mt-1.5 text-[11px] text-muted-foreground flex items-center gap-1">
        <Ban className="h-3 w-3 text-orange-500" />
        Cancelled by <span className="font-medium text-foreground/80">{leave.cancelledByName}</span>
        {leave.cancelledAt && <> &middot; {new Date(leave.cancelledAt).toLocaleDateString()}</>}
      </p>
    )
  }

  if (leave.status === 'APPROVED' || leave.status === 'REJECTED') {
    if (!leave.decidedByName) return null
    const by = leave.status === 'APPROVED' ? 'Approved' : 'Rejected'
    const Icon = leave.status === 'APPROVED' ? UserCheck : UserX
    return (
      <p className="mt-1.5 text-[11px] text-muted-foreground flex items-center gap-1">
        <Icon className={`h-3 w-3 ${leave.status === 'APPROVED' ? 'text-green-600' : 'text-red-500'}`} />
        {by} by <span className="font-medium text-foreground/80">{leave.decidedByName}</span>
        {leave.decidedAt && <> &middot; {new Date(leave.decidedAt).toLocaleDateString()}</>}
      </p>
    )
  }

  return null
}
