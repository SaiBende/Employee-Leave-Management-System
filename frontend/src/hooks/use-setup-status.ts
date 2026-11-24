import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'

export function useSetupStatus() {
  return useQuery({
    queryKey: ['setup-status'],
    queryFn: () => api.get<{ needsSetup: boolean }>('/auth/setup'),
    staleTime: 30_000,
    retry: 1,
  })
}
