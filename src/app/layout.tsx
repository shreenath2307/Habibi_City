import type { Metadata } from 'next'
import { playfair, ebGaramond, cormorant, courierPrime } from '@/lib/fonts'
import { AppProviders } from '@/components/providers/AppProviders'
import { Masthead } from '@/components/masthead/Masthead'
import { ClassicNav } from '@/components/nav/ClassicNav'
import './globals.css'

export const metadata: Metadata = {
  title: 'Habibi City — Notes from the Commute',
  description:
    'An anonymous, route-by-route community dispatch and timetable of city transit conditions, observations, and quiet moments.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${ebGaramond.variable} ${cormorant.variable} ${courierPrime.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[var(--bg-app)] text-[var(--ink-primary)] antialiased selection:bg-[var(--accent-brass)] selection:text-white">
        <AppProviders>
          <div className="flex flex-col min-h-screen">
            <Masthead />
            <ClassicNav />
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-24 md:pb-16" id="main-content">
              {children}
            </main>
          </div>
        </AppProviders>
      </body>
    </html>
  )
}
