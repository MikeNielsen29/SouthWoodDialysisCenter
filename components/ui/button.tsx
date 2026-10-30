"use client"

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { buttonClasses, type Size, type Variant } from './button-styles'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => (
    <button
      ref={ref}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {children}
    </button>
  ),
)

Button.displayName = 'Button'
