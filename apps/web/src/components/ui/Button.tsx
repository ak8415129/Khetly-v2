import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@lib/utils'
import { InlineSpinner } from '@components/common/PageSpinner'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 hover:bg-brand-800 text-brand-50 border-transparent disabled:bg-brand-200',
  secondary:
    'bg-brand-50 hover:bg-brand-100 text-brand-800 border-transparent disabled:bg-gray-100',
  outline:
    'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 disabled:text-gray-300',
  ghost:
    'bg-transparent hover:bg-gray-100 text-gray-600 border-transparent disabled:text-gray-300',
  destructive:
    'bg-red-600 hover:bg-red-700 text-white border-transparent disabled:bg-red-200',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-11 px-5 text-sm rounded-lg gap-2',
  lg: 'h-13 px-7 text-base rounded-xl gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium border transition-colors',
          'focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <InlineSpinner />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'
