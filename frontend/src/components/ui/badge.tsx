import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline'
}

const variants: Record<string, string> = {
  default: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  warning: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  danger: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  outline: 'border-border text-muted-foreground bg-transparent',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default' | 'outline'; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending' },
    APPROVED: { variant: 'success', label: 'Approved' },
    REJECTED: { variant: 'danger', label: 'Rejected' },
    CANCELLED: { variant: 'outline', label: 'Cancelled' },
  }
  const s = map[status] || { variant: 'default' as const, label: status }
  return <Badge variant={s.variant}>{s.label}</Badge>
}
