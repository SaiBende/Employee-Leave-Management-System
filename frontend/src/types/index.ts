export interface User {
  id: number
  name: string
  email: string
  role: 'MANAGER' | 'EMPLOYEE'
  department: string
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  departmentId: number
  role: string
}

export interface LeaveRequest {
  leaveType: string
  startDate: string
  endDate: string
  reason: string
}

export interface LeaveResponse {
  id: number
  employeeId: number
  employeeName: string
  leaveType: string
  startDate: string
  endDate: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  managerComments: string | null
  createdAt: string
  updatedAt: string
}

export interface EmployeeResponse {
  id: number
  name: string
  email: string
  department: string
  role: string
  managerId: number | null
  managerName: string | null
  createdAt: string
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

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}
