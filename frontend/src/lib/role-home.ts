export const roleHome = (role?: string | null): string => {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard'
    case 'MANAGER':
      return '/manager/dashboard'
    default:
      return '/employee/dashboard'
  }
}
