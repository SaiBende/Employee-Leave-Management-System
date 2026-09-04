import { useMemo, useState } from 'react'
import { useLeaveCalendar } from '@/hooks/use-leaves'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import ApproverNote from '@/components/ApproverNote'
import { cn } from '@/lib/utils'
import type { LeaveResponse } from '@/types'
import { CalendarDays, ChevronLeft, ChevronRight, CalendarClock } from 'lucide-react'

const statusStyles: Record<string, { bg: string; dot: string; label: string }> = {
  APPROVED: { bg: 'bg-green-500/20', dot: 'bg-green-500', label: 'Approved' },
  PENDING: { bg: 'bg-amber-500/20', dot: 'bg-amber-500', label: 'Pending' },
  REJECTED: { bg: 'bg-red-500/20', dot: 'bg-red-500', label: 'Rejected' },
  CANCELLED: { bg: 'bg-muted', dot: 'bg-muted-foreground/50', label: 'Cancelled' },
}

const weekdayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { data, isLoading: loading } = useLeaveCalendar()
  const leaves = data?.data ?? []

  const leavesByDate = useMemo(() => {
    const map: Record<string, LeaveResponse[]> = {}
    for (const leave of leaves) {
      const start = new Date(leave.startDate + 'T00:00:00')
      const end = new Date(leave.endDate + 'T00:00:00')
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split('T')[0]
        if (!map[key]) map[key] = []
        map[key].push(leave)
      }
    }
    return map
  }, [leaves])

  const { gridDays, monthLabel } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days: (Date | null)[] = Array.from({ length: startOffset }, () => null)
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d))

    return {
      gridDays: days,
      monthLabel: firstDay.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    }
  }, [currentDate])

  const todayKey = new Date().toISOString().split('T')[0]
  const toKey = (d: Date) => d.toISOString().split('T')[0]

  const selectedLeaves = selectedDate ? (leavesByDate[selectedDate] ?? []) : []
  const hasAnyLeave = (key: string) => (leavesByDate[key] ?? []).length > 0

  const moveMonth = (delta: number) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
    setSelectedDate(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Leave Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View leave days by month for you, your team, or the whole organization
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
          <CalendarDays className="h-4 w-4" />
          Calendar View
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-purple-500/40 to-cyan-500/40" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-primary shadow-md">
                  <CalendarDays className="h-5 w-5 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{monthLabel}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => moveMonth(-1)} aria-label="Previous month">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setCurrentDate(new Date()); setSelectedDate(null) }}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={() => moveMonth(1)} aria-label="Next month">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading calendar...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 min-w-[560px]">
                  {weekdayHeaders.map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2">
                      {day}
                    </div>
                  ))}
                  {gridDays.map((day, i) => {
                    if (!day) {
                      return <div key={`empty-${i}`} className="aspect-square rounded-lg bg-secondary/20 border border-transparent" />
                    }
                    const key = toKey(day)
                    const isToday = key === todayKey
                    const isSelected = key === selectedDate
                    const dayLeaves = leavesByDate[key] ?? []
                    const statuses = Array.from(new Set(dayLeaves.map((l) => l.status)))

                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedDate(isSelected ? null : key)}
                        className={cn(
                          "aspect-square rounded-lg border p-1 flex flex-col items-center justify-start gap-1 transition-all duration-200",
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                            : "border-border/60 bg-background hover:border-primary/40 hover:bg-secondary/50"
                        )}
                      >
                        <span className={cn(
                          "text-sm font-medium",
                          isToday ? "h-6 w-6 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center" : "text-foreground"
                        )}>
                          {day.getDate()}
                        </span>
                        {hasAnyLeave(key) && (
                          <div className="flex flex-wrap justify-center gap-0.5">
                            {statuses.map((s) => (
                              <span key={s} className={cn("h-1.5 w-1.5 rounded-full", statusStyles[s]?.dot)} />
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-green-500/40 via-amber-500/40 to-red-500/40" />
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {Object.entries(statusStyles).map(([status, style]) => (
                  <div key={status} className="flex items-center gap-3 text-sm">
                    <span className={cn("h-3 w-3 rounded-full", style.dot)} />
                    <span className="text-foreground">{style.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-cyan-500/40 via-purple-500/40 to-primary/40" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Select a day'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedLeaves.length > 0 ? (
                  <div className="space-y-3">
                    {selectedLeaves.map((leave) => (
                      <div key={leave.id} className="p-3 rounded-xl bg-secondary/50 border border-border/50 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">{leave.employeeName}</p>
                          <StatusBadge status={leave.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {leave.leaveType.charAt(0) + leave.leaveType.slice(1).toLowerCase()} &middot; {leave.startDate} to {leave.endDate}
                        </p>
                        <p className="text-xs text-muted-foreground/80 line-clamp-2">{leave.reason}</p>
                        <ApproverNote leave={leave} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No leaves on this day</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click any day to see leave details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
