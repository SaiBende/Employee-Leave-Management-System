import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { StatusBadge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { ApiResponse, LeaveResponse } from '@/types'
import { Eye, Search, X, Clock, Filter } from 'lucide-react'

export default function LeaveHistory() {
  const [leaves, setLeaves] = useState<LeaveResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchLeaves = async (type?: string, status?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (type) params.set('type', type)
      if (status) params.set('status', status)
      const qs = params.toString()
      const res = await api.get<ApiResponse<LeaveResponse[]>>(`/leaves${qs ? `/search?${qs}` : ''}`)
      setLeaves(res.data)
    } catch {
      const res = await api.get<ApiResponse<LeaveResponse[]>>('/leaves')
      setLeaves(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLeaves() }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLeaves(typeFilter, statusFilter)
  }

  const clearFilters = () => {
    setTypeFilter('')
    setStatusFilter('')
    fetchLeaves()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Leave History</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage your leave requests</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-purple-500/40 to-cyan-500/40" />
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[160px] space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Leave Type</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Select
                  className="pl-10"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  {['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'OTHER'].map((t) => (
                    <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex-1 min-w-[160px] space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Select
                  className="pl-10"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  {['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((s) => (
                    <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                <Search className="h-4 w-4" /> Search
              </Button>
              {(typeFilter || statusFilter) && (
                <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4" /> Clear
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Leave list */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/40 via-purple-500/40 to-cyan-500/40" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Requests</CardTitle>
            <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {leaves.length} total
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground">Loading...</p>
              </div>
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No leave requests found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {typeFilter || statusFilter ? 'Try adjusting your filters' : 'Apply for a leave to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all group">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{leave.reason}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {leave.leaveType} &middot; {leave.startDate} to {leave.endDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <StatusBadge status={leave.status} />
                    <Link to={`/employee/leaves/${leave.id}`}>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
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
