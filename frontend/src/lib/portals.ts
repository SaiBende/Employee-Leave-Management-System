import { Shield, Building2, Users, User } from 'lucide-react'
import type { Portal } from '@/types'

type PortalIcon = typeof Shield

export interface PortalConfig {
  id: Portal
  path: string
  label: string
  title: string
  subtitle: string
  description: string
  icon: PortalIcon
  accent: string
  iconBg: string
  badge: string
}

export const portals: PortalConfig[] = [
  {
    id: 'PLATFORM',
    path: '/platform/login',
    label: 'Platform',
    title: 'Platform Console',
    subtitle: 'Platform super admin',
    description: 'Oversee every company, create tenants, and manage platform access.',
    icon: Shield,
    accent: 'from-slate-900 via-slate-800 to-slate-600',
    iconBg: 'bg-slate-900',
    badge: 'bg-slate-100 text-slate-700',
  },
  {
    id: 'ADMIN',
    path: '/admin/login',
    label: 'Company Admin',
    title: 'Company Admin',
    subtitle: 'Company administrator',
    description: 'Run your company: employees, departments, leave policy, and approvals.',
    icon: Building2,
    accent: 'from-amber-500 via-orange-500 to-red-500',
    iconBg: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'MANAGER',
    path: '/manager/login',
    label: 'Manager',
    title: 'Manager',
    subtitle: 'Team lead',
    description: 'Review your team, approve leave, and keep balances up to date.',
    icon: Users,
    accent: 'from-purple-500 via-fuchsia-500 to-pink-500',
    iconBg: 'bg-purple-500',
    badge: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'EMPLOYEE',
    path: '/employee/login',
    label: 'Employee',
    title: 'Employee',
    subtitle: 'Team member',
    description: 'Apply for leave, track your requests, and check your balances.',
    icon: User,
    accent: 'from-blue-500 via-cyan-500 to-teal-500',
    iconBg: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700',
  },
]

export const portalByRole: Record<string, PortalConfig> = {
  SUPER_ADMIN: portals[0],
  ADMIN: portals[1],
  MANAGER: portals[2],
  EMPLOYEE: portals[3],
}

export const portalById = (id: Portal): PortalConfig =>
  portals.find((portal) => portal.id === id) ?? portals[3]
