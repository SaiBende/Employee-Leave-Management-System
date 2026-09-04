import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { LeaveResponse, LeaveBalance, DashboardData, EmployeeResponse, Dept } from '@/types'

export const queryKeys = {
  leaves: ['leaves'] as const,
  leave: (id: string) => ['leaves', id] as const,
  leaveCalendar: ['leaves', 'calendar'] as const,
  leaveBalances: ['leave-balances', 'me'] as const,
  leaveBalancesTeam: ['leave-balances', 'team'] as const,
  pendingLeaves: ['manager', 'pending-leaves'] as const,
  managerEmployees: ['manager', 'employees'] as const,
  employeeLeaves: (id: string) => ['manager', 'employees', id, 'leaves'] as const,
  departments: ['departments'] as const,
  dashboardEmployee: ['dashboard', 'employee'] as const,
  dashboardManager: ['dashboard', 'manager'] as const,
  dashboardAdmin: ['dashboard', 'admin'] as const,
  adminLeaves: ['admin', 'leaves'] as const,
  adminEmployees: ['admin', 'employees'] as const,
  adminDepartments: ['admin', 'departments'] as const,
  employeeProfile: ['employees', 'me'] as const,
  users: ['users'] as const,
}

// Leave queries
export function useLeaves() {
  return useQuery({
    queryKey: queryKeys.leaves,
    queryFn: () => api.get<{ data: LeaveResponse[] }>('/leaves'),
  })
}

export function useLeave(id: string) {
  return useQuery({
    queryKey: queryKeys.leave(id),
    queryFn: () => api.get<{ data: LeaveResponse }>(`/leaves/${id}`),
    enabled: !!id,
  })
}

export function useLeaveCalendar() {
  return useQuery({
    queryKey: queryKeys.leaveCalendar,
    queryFn: () => api.get<{ data: LeaveResponse[] }>('/leaves/calendar'),
  })
}

// Balance queries
export function useMyBalances() {
  return useQuery({
    queryKey: queryKeys.leaveBalances,
    queryFn: () => api.get<{ data: LeaveBalance[] }>('/leave-balances/me'),
  })
}

export function useTeamBalances() {
  return useQuery({
    queryKey: queryKeys.leaveBalancesTeam,
    queryFn: () => api.get<{ data: LeaveBalance[] }>('/leave-balances/team'),
  })
}

// Manager queries
export function usePendingLeaves() {
  return useQuery({
    queryKey: queryKeys.pendingLeaves,
    queryFn: () => api.get<{ data: LeaveResponse[] }>('/manager/pending-leaves'),
  })
}

export function useManagerEmployees() {
  return useQuery({
    queryKey: queryKeys.managerEmployees,
    queryFn: () => api.get<{ data: EmployeeResponse[] }>('/manager/employees'),
  })
}

export function useEmployeeLeaves(id: string) {
  return useQuery({
    queryKey: queryKeys.employeeLeaves(id),
    queryFn: () => api.get<{ data: LeaveResponse[] }>(`/manager/employees/${id}/leaves`),
    enabled: !!id,
  })
}

// Dashboard queries
export function useEmployeeDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboardEmployee,
    queryFn: () => api.get<{ data: DashboardData }>('/dashboard/employee'),
  })
}

export function useManagerDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboardManager,
    queryFn: () => api.get<{ data: DashboardData }>('/dashboard/manager'),
  })
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboardAdmin,
    queryFn: () => api.get<{ data: DashboardData }>('/admin/dashboard'),
  })
}

// Admin queries
export function useAdminLeaves() {
  return useQuery({
    queryKey: queryKeys.adminLeaves,
    queryFn: () => api.get<{ data: LeaveResponse[] }>('/admin/leaves'),
  })
}

export function useAdminEmployees() {
  return useQuery({
    queryKey: queryKeys.adminEmployees,
    queryFn: () => api.get<{ data: EmployeeResponse[] }>('/admin/employees'),
  })
}

export function useAdminDepartments() {
  return useQuery({
    queryKey: queryKeys.adminDepartments,
    queryFn: () => api.get<{ data: { id: number; name: string }[] }>('/admin/departments'),
  })
}

// Departments
export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments,
    queryFn: () => api.get<{ data: Dept[] }>('/departments'),
  })
}

// Profile
export function useEmployeeProfile() {
  return useQuery({
    queryKey: queryKeys.employeeProfile,
    queryFn: () => api.get<{ data: EmployeeResponse }>('/employees/me'),
  })
}

// Mutations
export function useApplyLeave() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { leaveType: string; startDate: string; endDate: string; reason: string }) =>
      api.post<{ data: LeaveResponse }>('/leaves', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves })
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveBalances })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardEmployee })
    },
  })
}

export function useCancelLeave() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.put(`/leaves/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves })
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveBalances })
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingLeaves })
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLeaves })
    },
  })
}

export function useApproveLeave() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      api.put(`/manager/leaves/${id}/approve`, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingLeaves })
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLeaves })
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves })
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveBalances })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardManager })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardAdmin })
    },
  })
}

export function useRejectLeave() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      api.put(`/manager/leaves/${id}/reject`, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingLeaves })
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLeaves })
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardManager })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardAdmin })
    },
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ leaveId, comment }: { leaveId: string; comment: string }) =>
      api.post(`/leaves/${leaveId}/comments`, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves })
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLeaves })
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingLeaves })
    },
  })
}

export function useEditLeave() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { leaveType: string; startDate: string; endDate: string; reason: string } }) =>
      api.put(`/leaves/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves })
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveBalances })
    },
  })
}

export function useAddEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/employees', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminEmployees })
      queryClient.invalidateQueries({ queryKey: queryKeys.managerEmployees })
    },
  })
}

export function useAddDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => api.post('/admin/departments', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDepartments })
      queryClient.invalidateQueries({ queryKey: queryKeys.departments })
    },
  })
}

export function useUpdateTeamBalances() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (balances: { userId: number; leaveType: string; totalDays: number }[]) =>
      api.put('/leave-balances/team', { balances }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveBalancesTeam })
    },
  })
}
