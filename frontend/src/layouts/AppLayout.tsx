import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, LogOut, User, FileText, Clock,
  CalendarPlus, ChevronLeft, Menu, CheckSquare, Building2
} from 'lucide-react'
import { useState } from 'react'

const employeeNav = [
  { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employee/leaves/apply', label: 'Apply Leave', icon: CalendarPlus },
  { to: '/employee/leaves', label: 'Leave History', icon: Clock },
  { to: '/employee/profile', label: 'Profile', icon: User },
]

const managerNav = [
  { to: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/manager/pending', label: 'Pending Approvals', icon: CheckSquare },
  { to: '/manager/employees', label: 'My Team', icon: Users },
  { to: '/manager/employees/add', label: 'Add Employee', icon: User },
  { to: '/employee/profile', label: 'Profile', icon: Building2 },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isManager = user?.role === 'MANAGER'
  const navItems = isManager ? managerNav : employeeNav

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-secondary/30 via-background to-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary shadow-lg shadow-primary/30 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-foreground leading-tight">Employee Leave Management System</p>
              <p className="text-[10px] text-muted-foreground">{user?.email}</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-md">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                isManager ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
              )}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest pb-2">
            {isManager ? 'Manager Menu' : 'Employee Menu'}
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.to ||
              (item.to === '/employee/leaves' && location.pathname.startsWith('/employee/leaves/'))
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 transition-transform duration-200", active ? "" : "group-hover:scale-110")} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group"
          >
            <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="flex items-center gap-3 p-4 border-b border-border bg-card/80 backdrop-blur-sm lg:hidden sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-primary flex items-center justify-center">
              <FileText className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-foreground">Employee Leave Management System</h1>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
