import { useState } from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import type { ApiResponse, LeaveComment } from '@/types'
import { MessageSquare, Send } from 'lucide-react'

interface LeaveCommentThreadProps {
  leaveId: number
  initialComments?: LeaveComment[] | null
  currentUserId?: number
}

export default function LeaveCommentThread({ leaveId, initialComments, currentUserId }: LeaveCommentThreadProps) {
  const [comments, setComments] = useState<LeaveComment[]>(initialComments ?? [])
  const [newComment, setNewComment] = useState('')
  const [sending, setSending] = useState(false)

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSending(true)
    try {
      const res = await api.post<ApiResponse<LeaveComment>>(`/leaves/${leaveId}/comments`, { comment: newComment })
      setComments((prev) => [...prev, res.data])
      setNewComment('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add comment')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Discussion <span className="ml-1 normal-case text-muted-foreground/60">({comments.length})</span>
      </p>

      {comments.length === 0 ? (
        <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-1" />
          <p className="text-sm text-muted-foreground">No comments yet. Start the discussion.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50">
              <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
                {c.authorName?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">{c.authorName}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {c.authorRole === 'ADMIN' ? 'Admin' : c.authorRole === 'MANAGER' ? 'Manager' : 'Employee'}
                    {c.authorId === currentUserId ? ' (you)' : ''} &middot; {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-0.5 leading-relaxed">{c.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAddComment} className="flex items-center gap-2">
        <input
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-all hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button type="submit" size="icon" disabled={sending || !newComment.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
