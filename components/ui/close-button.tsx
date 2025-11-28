/**
 * リッチな閉じるボタンコンポーネント
 */
'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CloseButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'ghost';
  'aria-label'?: string;
}

export function CloseButton({
  onClick,
  className,
  size = 'md',
  variant = 'default',
  'aria-label': ariaLabel = '閉じる',
}: CloseButtonProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-7 w-7',
    lg: 'h-8 w-8',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  const variantClasses = {
    default: 'bg-muted/60 hover:bg-destructive/90 hover:text-white',
    subtle: 'hover:bg-muted hover:text-foreground',
    ghost: 'opacity-60 hover:opacity-100 hover:bg-muted/50',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        'text-muted-foreground transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        'active:scale-95',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <X className={cn(iconSizes[size], 'stroke-[2.5]')} />
    </button>
  );
}
