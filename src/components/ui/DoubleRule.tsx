import React from 'react'
import { Fleuron } from './Fleuron'

interface DoubleRuleProps {
  ornament?: boolean
  className?: string
}

export function DoubleRule({ ornament = false, className = '' }: DoubleRuleProps) {
  if (ornament) {
    return (
      <div className={`relative my-6 flex items-center justify-center ${className}`}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-b border-[var(--rule-color)] h-[4px]" />
        </div>
        <div className="relative bg-[var(--bg-app)] px-3">
          <Fleuron variant="single" className="text-base" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`my-4 border-t-[3px] border-b border-[var(--rule-color)] h-[5px] opacity-90 ${className}`}
      aria-hidden="true"
    />
  )
}
