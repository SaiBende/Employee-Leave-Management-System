import { cn } from '@/lib/utils'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning'
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon'
}

const variantStyles = {
  default: 'bg-gradient-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]',
  secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:scale-[0.98]',
  outline: 'border-2 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-gradient-danger text-destructive-foreground shadow-md shadow-destructive/20 hover:shadow-lg hover:shadow-destructive/30 active:scale-[0.98]',
  success: 'bg-gradient-success text-success-foreground shadow-md shadow-success/20 hover:shadow-lg active:scale-[0.98]',
  warning: 'bg-gradient-warning text-warning-foreground shadow-md shadow-warning/20 hover:shadow-lg active:scale-[0.98]',
}

const sizeStyles = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 rounded-md px-8',
  xl: 'h-12 rounded-xl px-8 text-base',
  icon: 'h-9 w-9',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
export type { ButtonProps }
