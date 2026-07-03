import { Outlet, Link } from 'react-router-dom'
import { FileText } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-background relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply blur-3xl" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply blur-3xl" />

      {/* Branding */}
      <div className="relative z-10 pt-8 px-4 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary shadow-lg shadow-primary/30 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Employee Leave Management System</span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative z-10 p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 pb-4 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; 2026 Employee Leave Management System. All rights reserved.
        </p>
      </div>
    </div>
  )
}
