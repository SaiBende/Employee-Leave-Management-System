import type { LeaveResponse } from '@/types'
import { UserCheck, UserX } from 'lucide-react'

export default function ApproverNote({ leave }: { leave: LeaveResponse }) {
  if (!leave.decidedByName) return null
  const by = (leave.status === 'APPROVED' ? 'Approved' : 'Rejected') + ' by '
  const Icon = leave.status === 'APPROVED' ? UserCheck : UserX
  return (
    <p className="mt-1.5 text-[11px] text-muted-foreground flex items-center gap-1">
      <Icon className={`h-3 w-3 ${leave.status === 'APPROVED' ? 'text-green-600' : 'text-red-500'}`} />
      {by}<span className="font-medium text-foreground/80">{leave.decidedByName}</span>
      {leave.decidedAt && <> &middot; {new Date(leave.decidedAt).toLocaleDateString()}</>}
    </p>
  )
}