import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ApiResponse, LeaveBalance } from '@/types'
import { Coins, Save, X, ChevronDown, ChevronUp, Users } from 'lucide-react'

export default function TeamBalances() {
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ totalDays: 0, usedDays: 0 })
  const [expandedEmployee, setExpandedEmployee] = useState<number | null>(null)

  useEffect(() => {
    api.get<ApiResponse<LeaveBalance[]>>('/leave-balances/team')
      .then((res) => setBalances(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const grouped = balances.reduce<Record<string, LeaveBalance[]>>((acc, b) => {
    const key = `${b.employeeId}-${b.employeeName}`
    if (!acc[key]) acc[key] = []
    acc[key].push(b)
    return acc
  }, {})

  const handleEdit = (balance: LeaveBalance) => {
    setEditForm({ totalDays: balance.totalDays, usedDays: balance.usedDays })
    setEditingId(balance.id)
  }

  const handleSave = async (id: number) => {
    try {
      const res = await api.put<ApiResponse<LeaveBalance>>(`/leave-balances/${id}`, editForm)
      setBalances((prev) => prev.map((b) => (b.id === id ? res.data : b)))
      setEditingId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update balance')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading team balances...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Team Leave Balances</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage leave balances for your team</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12">
            <div className="text-center">
              <Coins className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No team balances found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([empKey, empBalances]) => {
            const empName = empBalances[0].employeeName
            const isExpanded = expandedEmployee === empBalances[0].employeeId
            return (
              <Card key={empKey} className="border-0 shadow-md overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-400/40 via-teal-500/40 to-cyan-500/40" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold shadow-md">
                        {empBalances[0].employeeName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{empBalances[0].employeeName}</CardTitle>
                        <p className="text-xs text-muted-foreground">{empBalances.length} leave types</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedEmployee(isExpanded ? null : empBalances[0].employeeId)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent>
                    <div className="space-y-3">
                      {empBalances.map((b) => (
                        <div key={b.id} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{b.leaveType}</p>
                              {editingId === b.id ? (
                                <div className="flex items-center gap-3 mt-2">
                                  <div>
                                    <label className="text-xs text-muted-foreground">Total</label>
                                    <Input
                                      type="number"
                                      className="h-8 w-20"
                                      value={editForm.totalDays}
                                      onChange={(e) => setEditForm({ ...editForm, totalDays: parseInt(e.target.value) || 0 })}
                                      min={0}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground">Used</label>
                                    <Input
                                      type="number"
                                      className="h-8 w-20"
                                      value={editForm.usedDays}
                                      onChange={(e) => setEditForm({ ...editForm, usedDays: parseInt(e.target.value) || 0 })}
                                      min={0}
                                    />
                                  </div>
                                  <div className="flex gap-1 mt-5">
                                    <Button size="sm" variant="success" onClick={() => handleSave(b.id)}>
                                      <Save className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-sm text-muted-foreground">
                                    Total: <strong>{b.totalDays}</strong>
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    Used: <strong>{b.usedDays}</strong>
                                  </span>
                                  <span className="text-sm font-semibold text-emerald-600">
                                    Remaining: {b.totalDays - b.usedDays}
                                  </span>
                                  <Button variant="ghost" size="sm" onClick={() => handleEdit(b)}>
                                    Edit
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}