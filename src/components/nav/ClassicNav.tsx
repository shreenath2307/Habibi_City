'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { Newspaper, PenTool, Mail, Compass, BookOpen } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Front page', icon: Newspaper },
  { href: '/write', label: 'Write', icon: PenTool },
  { href: '/letters', label: 'Letters', icon: Mail },
  { href: '/map', label: 'Transit map', icon: Compass },
  { href: '/about', label: 'About', icon: BookOpen },
]

export function ClassicNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Navigation: Centered Classic Labelled Tab Bar */}
      <nav
        className="hidden md:flex items-center justify-center border-b border-[var(--rule-subtle)] pb-2 mb-6 max-w-4xl mx-auto px-4"
        aria-label="Main Navigation"
      >
        <div className="flex items-center gap-1 sm:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 flex items-center gap-2 text-sm transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-brass)] ${
                  isActive
                    ? 'text-[var(--ink-primary)] font-semibold'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-4 h-4 opacity-80" strokeWidth={1.5} />
                <span className="small-caps tracking-wider text-base">{item.label}</span>

                {/* Animated ink stroke underline */}
                {isActive && (
                  <motion.div
                    layoutId="desktopNavInkLine"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--accent-brass)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile Navigation: Classic Fixed Bottom Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface-card)] border-t-2 border-[var(--rule-color)] px-2 py-1.5 shadow-paper-elevated"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1 px-2.5 min-w-[56px] min-h-[44px] transition-colors rounded-sm focus-visible:outline-none ${
                  isActive
                    ? 'text-[var(--accent-oxblood)] font-semibold'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 mb-0.5" strokeWidth={1.5} />
                <span className="text-[10px] uppercase font-mono tracking-wider">{item.label}</span>

                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="mobileNavDot"
                    className="w-1.5 h-1.5 rounded-full bg-[var(--accent-oxblood)] mt-0.5"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
