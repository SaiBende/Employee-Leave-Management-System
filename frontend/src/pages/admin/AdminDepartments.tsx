import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ApiResponse as ApiResp } from '@/types'
import { Building2, Plus, Trash2 } from 'lucide-react'

export default function AdminDepartments() {
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')

  const load = () =>
    api.get<ApiResp<{ id: number; name: string }[]>>('/admin/departments')
      .then((res) => setDepartments(res.data))
      .catch(console.error)

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const handleAdd = async () => {
    if (!newName.trim()) return
    try {
      await api.post('/admin/departments', { name: newName })
      setNewName('')
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create department')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this department?')) return
    try {
      await api.delete(`/admin/departments/${id}`)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading departments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Manage Departments</h1>
        <p className="text-sm text-muted-foreground mt-1">Create and remove departments</p>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Department name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-400/40 via-orange-500/40 to-red-500/40" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Departments</CardTitle>
            <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {departments.length} departments
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {departments.map((dept) => (
            <div key={dept.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 mb-3 last:mb-0">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{dept.name}</span>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(dept.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}