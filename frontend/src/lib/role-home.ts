export const loginPathForRole = (role?: string | null): string => {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/platform/login'
    case 'ADMIN':
      return '/admin/login'
    case 'MANAGER':
      return '/manager/login'
    case 'EMPLOYEE':
      return '/employee/login'
    default:
      return '/login'
  }
}

export const roleHome = (role?: string | null): string => {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/platform/dashboard'
    case 'ADMIN':
      return '/admin/dashboard'
    case 'MANAGER':
      return '/manager/dashboard'
    default:
      return '/employee/dashboard'
  }
}

export const roleLabel = (role?: string | null): string => {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Platform Admin'
    case 'ADMIN':
      return 'Company Admin'
    case 'MANAGER':
      return 'Manager'
    case 'EMPLOYEE':
      return 'Employee'
    default:
      return 'User'
  }
}
