import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import AuthLayout from '@/layouts/AuthLayout'
import AppLayout from '@/layouts/AppLayout'
import Home from '@/pages/Home'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import EmployeeDashboard from '@/pages/employee/EmployeeDashboard'
import ApplyLeave from '@/pages/employee/ApplyLeave'
import LeaveHistory from '@/pages/employee/LeaveHistory'
import LeaveDetails from '@/pages/employee/LeaveDetails'
import EditLeave from '@/pages/employee/EditLeave'
import Profile from '@/pages/employee/Profile'
import MyBalances from '@/pages/employee/MyBalances'
import ManagerDashboard from '@/pages/manager/ManagerDashboard'
import PendingApprovals from '@/pages/manager/PendingApprovals'
import TeamMembers from '@/pages/manager/TeamMembers'
import AddEmployee from '@/pages/manager/AddEmployee'
import EmployeeLeaveHistory from '@/pages/manager/EmployeeLeaveHistory'
import TeamBalances from '@/pages/manager/TeamBalances'
import NotFound from '@/pages/NotFound'

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: string }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'MANAGER' ? '/manager/dashboard' : '/employee/dashboard'} replace />
  }
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (user) {
    return <Navigate to={user.role === 'MANAGER' ? '/manager/dashboard' : '/employee/dashboard'} replace />
  }
  return <>{children}</>
}

function HeaderWithPath() {
  const location = useLocation()

  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
    return null
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <h1 className="text-lg font-semibold text-foreground">Employee Leave Management System</h1>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HeaderWithPath />
        <Routes>
          <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route path="/" element={<Home />} />

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/leaves/apply" element={<ApplyLeave />} />
            <Route path="/employee/leaves" element={<LeaveHistory />} />
            <Route path="/employee/leaves/:id" element={<LeaveDetails />} />
            <Route path="/employee/leaves/:id/edit" element={<EditLeave />} />
            <Route path="/employee/profile" element={<Profile />} />
            <Route path="/employee/balances" element={<MyBalances />} />
          </Route>

          <Route element={<ProtectedRoute allowedRole="MANAGER"><AppLayout /></ProtectedRoute>}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/pending" element={<PendingApprovals />} />
            <Route path="/manager/employees" element={<TeamMembers />} />
            <Route path="/manager/employees/add" element={<AddEmployee />} />
            <Route path="/manager/employees/:id/leaves" element={<EmployeeLeaveHistory />} />
            <Route path="/manager/balances" element={<TeamBalances />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
