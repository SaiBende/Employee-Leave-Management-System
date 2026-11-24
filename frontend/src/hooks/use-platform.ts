import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { ApiResponse, Company, PlatformDashboard } from '@/types'

export const platformKeys = {
  dashboard: ['platform', 'dashboard'] as const,
  companies: ['platform', 'companies'] as const,
}

export function usePlatformDashboard() {
  return useQuery({
    queryKey: platformKeys.dashboard,
    queryFn: () => api.get<ApiResponse<PlatformDashboard>>('/platform/dashboard'),
  })
}

export function useCompanies() {
  return useQuery({
    queryKey: platformKeys.companies,
    queryFn: () => api.get<ApiResponse<Company[]>>('/platform/companies'),
  })
}

export interface CreateCompanyInput {
  companyName: string
  adminName: string
  adminEmail: string
  adminPassword: string
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCompanyInput) =>
      api.post<ApiResponse<Company>>('/platform/companies', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.companies })
      queryClient.invalidateQueries({ queryKey: platformKeys.dashboard })
    },
  })
}

export function useUpdateCompanyStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      api.put<ApiResponse<Company>>(`/platform/companies/${id}/status`, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.companies })
      queryClient.invalidateQueries({ queryKey: platformKeys.dashboard })
    },
  })
}
