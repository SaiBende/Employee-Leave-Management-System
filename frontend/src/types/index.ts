export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
export type Portal = 'PLATFORM' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  department?: string | null
  companyId?: number | null
  companyName?: string | null
  companySlug?: string | null
  mustChangePassword?: boolean
  token: string
}

export interface LoginRequest {
  email: string
  password: string
  portal: Portal
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  departmentId: number
  role: string
  managerId?: number
}

export interface LeaveRequest {
  leaveType: string
  startDate: string
  endDate: string
  reason: string
}

export interface LeaveComment {
  id: number
  leaveId: number
  authorId: number
  authorName: string
  authorRole: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  comment: string
  createdAt: string
}

export interface LeaveResponse {
  id: number
  employeeId: number
  employeeName: string
  employeeRole?: string
  leaveType: string
  startDate: string
  endDate: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  managerComments: string | null
  decidedById?: number | null
  decidedByName?: string | null
  decidedAt?: string | null
  cancelledById?: number | null
  cancelledByName?: string | null
  cancelledAt?: string | null
  createdAt: string
  updatedAt: string
  comments?: LeaveComment[]
}

export interface EmployeeResponse {
  id: number
  name: string
  email: string
  department: string | null
  role: string
  companyId?: number | null
  companyName?: string | null
  companySlug?: string | null
  managerId: number | null
  managerName: string | null
  mustChangePassword?: boolean
  createdAt: string
}

export interface Company {
  id: number
  name: string
  slug: string
  active: boolean
  adminName: string | null
  adminEmail: string | null
  employeeCount: number
  departmentCount: number
  createdAt: string
}

export interface PlatformDashboard {
  totalCompanies: number
  activeCompanies: number
  totalEmployees: number
  totalLeaves: number
}

export interface CompanySignupResult {
  companyId: number
  companyName: string
  adminEmail: string
}

export interface DashboardData {
  totalLeaves: number
  approvedLeaves: number
  pendingLeaves: number
  rejectedLeaves: number
  totalEmployees?: number
  pendingApprovals?: number
  recentActivities: LeaveResponse[]
}

export interface LeaveBalance {
  id: number
  employeeId: number
  employeeName: string
  leaveType: string
  totalDays: number
  usedDays: number
  remainingDays: number
  year: number
}

export interface Dept {
  id: number
  name: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}
