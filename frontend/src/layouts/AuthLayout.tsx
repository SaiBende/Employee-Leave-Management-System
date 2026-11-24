import { Outlet, Link } from 'react-router-dom'
import { FileText } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-background relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply blur-3xl" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-primary/15 rounded-full mix-blend-multiply blur-3xl" />

      {/* Branding */}
      <div className="relative z-10 pt-8 px-4 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary shadow-lg shadow-primary/30 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Leave Manager</span>
          <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
            Multi-company
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative z-10 p-4">
        <div className="w-full py-6">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 pb-4 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; 2026 Leave Manager. All rights reserved.
        </p>
      </div>
    </div>
  )
}
