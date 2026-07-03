import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  variant?: 'primary' | 'success' | 'warning' | 'danger'
}

const variantStyles = {
  primary: 'from-primary/20 to-primary/5 text-primary',
  success: 'from-green-500/20 to-green-500/5 text-green-600',
  warning: 'from-amber-500/20 to-amber-500/5 text-amber-600',
  danger: 'from-red-500/20 to-red-500/5 text-red-600',
}

export function StatCard({ title, value, icon: Icon, variant = 'primary' }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className="h-1 w-full bg-gradient-to-r from-primary/40 to-primary/10" />
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div className={cn(
            "p-3 rounded-xl bg-gradient-to-br shadow-sm",
            variantStyles[variant]
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
