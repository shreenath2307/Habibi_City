import React from 'react'

interface FleuronProps {
  variant?: 'single' | 'branch' | 'star'
  className?: string
}

export function Fleuron({ variant = 'single', className = '' }: FleuronProps) {
  let glyph = '❦'
  if (variant === 'branch') glyph = '❧'
  if (variant === 'star') glyph = '※'

  return (
    <span
      className={`inline-block select-none text-[var(--accent-brass)] opacity-80 ${className}`}
      aria-hidden="true"
    >
      {glyph}
    </span>
  )
}
