export type Variant =
  | 'primary'
  | 'accent'
  | 'outline'
  | 'ghost'
  | 'light'
  // `gradient` and `solid` are legacy names kept for the existing admin pages.
  | 'gradient'
  | 'solid'

export type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-800 text-sand-50 hover:bg-brand-900 shadow-soft hover:shadow-lift',
  accent:
    'bg-ember-500 text-white hover:bg-ember-600 shadow-soft hover:shadow-lift',
  outline:
    'border border-ink/15 text-ink hover:border-brand-700 hover:text-brand-700 bg-transparent',
  ghost: 'text-ink-soft hover:text-brand-700',
  light: 'bg-sand-50 text-brand-900 hover:bg-white shadow-soft',
  gradient:
    'bg-ember-500 text-white hover:bg-ember-600 shadow-soft hover:shadow-lift',
  solid: 'bg-brand-800 text-sand-50 hover:bg-brand-900 shadow-soft',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-[13px]',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-[15px]',
}

/** Shared class builder so links and buttons can look identical. */
export function buttonClasses(
  variant: Variant = 'primary',
  size: Size = 'md',
  className = '',
) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`
}
