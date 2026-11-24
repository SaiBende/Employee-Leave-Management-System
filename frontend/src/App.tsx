import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { roleHome } from '@/lib/role-home'
import AuthLayout from '@/layouts/AuthLayout'
import AppLayout from '@/layouts/AppLayout'
import Home from '@/pages/Home'
import PortalChooserPage from '@/pages/auth/PortalChooserPage'
import PortalLoginPage from '@/pages/auth/PortalLoginPage'
import SetupPage from '@/pages/auth/SetupPage'
import CompanySignupPage from '@/pages/auth/CompanySignupPage'
import ChangePasswordPage from '@/pages/auth/ChangePasswordPage'
import EmployeeDashboard from '@/pages/employee/EmployeeDashboard'
import ApplyLeave from '@/pages/employee/ApplyLeave'
import LeaveHistory from '@/pages/employee/LeaveHistory'
import LeaveDetails from '@/pages/employee/LeaveDetails'
import EditLeave from '@/pages/employee/EditLeave'
import Profile from '@/pages/employee/Profile'
import MyBalances from '@/pages/employee/MyBalances'
import Calendar from '@/pages/Calendar'
import ManagerDashboard from '@/pages/manager/ManagerDashboard'
import PendingApprovals from '@/pages/manager/PendingApprovals'
import TeamMembers from '@/pages/manager/TeamMembers'
import AddEmployee from '@/pages/manager/AddEmployee'
import EmployeeLeaveHistory from '@/pages/manager/EmployeeLeaveHistory'
import TeamBalances from '@/pages/manager/TeamBalances'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminApprovals from '@/pages/admin/AdminApprovals'
import AdminLeaves from '@/pages/admin/AdminLeaves'
import AdminEmployees from '@/pages/admin/AdminEmployees'
import AdminDepartments from '@/pages/admin/AdminDepartments'
import AdminAddEmployee from '@/pages/admin/AdminAddEmployee'
import PlatformDashboard from '@/pages/platform/PlatformDashboard'
import PlatformCompanies from '@/pages/platform/PlatformCompanies'
import NotFound from '@/pages/NotFound'

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  )
}

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: Role[]
}) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />
  }
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />
  if (user) {
    return <Navigate to={user.mustChangePassword ? '/change-password' : roleHome(user.role)} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
            <Route path="/login" element={<PortalChooserPage />} />
            <Route path="/platform/login" element={<PortalLoginPage portal="PLATFORM" />} />
            <Route path="/admin/login" element={<PortalLoginPage portal="ADMIN" />} />
            <Route path="/manager/login" element={<PortalLoginPage portal="MANAGER" />} />
            <Route path="/employee/login" element={<PortalLoginPage portal="EMPLOYEE" />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/signup" element={<CompanySignupPage />} />
            <Route path="/register" element={<Navigate to="/signup" replace />} />
          </Route>

          <Route element={<ProtectedRoute><AuthLayout /></ProtectedRoute>}>
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>

          <Route path="/" element={<Home />} />

          <Route
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'ADMIN']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/leaves/apply" element={<ApplyLeave />} />
            <Route path="/employee/leaves" element={<LeaveHistory />} />
            <Route path="/employee/leaves/:id" element={<LeaveDetails />} />
            <Route path="/employee/leaves/:id/edit" element={<EditLeave />} />
            <Route path="/employee/profile" element={<Profile />} />
            <Route path="/employee/balances" element={<MyBalances />} />
            <Route path="/calendar" element={<Calendar />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/pending" element={<PendingApprovals />} />
            <Route path="/manager/employees" element={<TeamMembers />} />
            <Route path="/manager/employees/add" element={<AddEmployee />} />
            <Route path="/manager/employees/:id/leaves" element={<EmployeeLeaveHistory />} />
            <Route path="/manager/balances" element={<TeamBalances />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/pending" element={<AdminApprovals />} />
            <Route path="/admin/leaves" element={<AdminLeaves />} />
            <Route path="/admin/employees" element={<AdminEmployees />} />
            <Route path="/admin/departments" element={<AdminDepartments />} />
            <Route path="/admin/employees/add" element={<AdminAddEmployee />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/platform/dashboard" element={<PlatformDashboard />} />
            <Route path="/platform/companies" element={<PlatformCompanies />} />
          </Route>

          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/manager" element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="/employee" element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="/platform" element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
