# Habibi City — Notes from the Commute

*A Victorian railway timetable & broadsheet newspaper community dispatch application.*

---

## Overview

**Habibi City** is an anonymous, route-by-route community dispatch app for city commuters. Travellers share real-time reports about transit routes (*"delay"*, *"crowded"*, *"all clear"*) alongside quieter observations (*"kindness"*, *"small moments"*, *"vibes"*). The application also features a *"Letters to the city"* broadsheet archive, an interactive transit geometry map, and a physical-style commuter punch-card streak.

- **No accounts or signups**: Post and read immediately.
- **No geolocation or GPS tracking**: Stations and routes are selected manually.
- **Local identity**: Anonymous randomized UUID stored exclusively in your browser's `localStorage`.
- **Community moderation**: Automated abuse filters, crisis helpline detection, and a 3-report threshold that automatically hides items server-side.

---

## Tech Stack & Architecture

- **Framework**: Next.js 15 (App Router) + Strict TypeScript
- **Styling**: Tailwind CSS with design tokens defined as CSS variables in `src/app/tokens.css`
- **Art Direction**: Victorian Broadsheet & Railway Timetable
  - **Light "Paper" Theme**: `#F4EEDF` (aged cream), `#FBF7EC` (stationery), `#1F1A14` (printer's ink), thin double rules (`3px` + `1px`), and static SVG paper noise.
  - **Dark "Candlelit" Theme**: `#16120D` (candlelit deep night), `#1F1912`, `#EFE6D2`.
  - **Heritage Route Inks**: Oxblood (`#7A1F2B`), Royal Navy (`#1D2B4A`), Bottle Green (`#1F4D3A`), Antique Brass (`#A67C2E`), and Heritage Plum (`#4A203B`).
- **Typography (`next/font`)**:
  - `Playfair Display`: Masthead and broadsheet headlines
  - `EB Garamond`: Body and UI text (≥ 17px)
  - `Cormorant Garamond`: Literary letters and long-form reading
  - `Courier Prime`: Monospace timetables, timestamps, and ticker ribbon
- **Animation**: Motion (`motion/react`) for layout transitions and gestures; Lenis for smooth scrolling (with automatic `prefers-reduced-motion` bypass).
- **Data & State**: TanStack Query (`@tanstack/react-query`) for Supabase data caching and optimistic mutations; Supabase JS client.
- **Map**: Leaflet + `react-leaflet` with locally bundled CSS (no external CDN), sepia/ink-wash Carto tiles, and custom brass-and-ink SVG station pins.
- **Testing**: Vitest unit test suite covering client moderation, streak calculations, and 60-minute route condition aggregations.

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx            # Broadsheet layout with Masthead, ClassicNav, and Providers
│   ├── page.tsx              # Front Page: 12-col grid, Line Conditions, Ticker, Feed, Ticket Rail
│   ├── write/page.tsx        # Structured 2-step compose, live preview, postcard franked submit
│   ├── letters/page.tsx      # Broadsheet letters, wax-seal unfold, compose modal
│   ├── map/page.tsx          # Leaflet map with local CSS, brass pins, Arrival Manifest
│   ├── about/page.tsx        # Manifesto, anonymity promise, moderation rules, crisis resources
│   ├── globals.css           # Typography resets, double rules, paper texture
│   ├── tokens.css            # CSS variable tokens for Paper and Candlelit themes
│   ├── loading.tsx           # Global railway loading skeleton
│   └── error.tsx             # Global service interruption boundary
├── components/
│   ├── board/
│   │   ├── DepartureRibbon.tsx # Pausable split-flap dispatch ticker ribbon
│   │   └── LineConditions.tsx  # Timetable status diagram with 60-min report counts
│   ├── feed/
│   │   ├── SlimHeroStrip.tsx   # Dismissible "How it works" 3-step guide
│   │   ├── FilterRail.tsx      # Segmented category control and route filter chips
│   │   ├── PostCard.tsx        # Card with route-colored left rule, like/comment/report
│   │   └── CommentTray.tsx     # Expandable notes tray with inline moderation
│   ├── ticket/
│   │   ├── CommuterTicket.tsx  # 7-slot punch card with 3/7/30 milestone badges
│   │   └── SidebarRail.tsx     # Sticky desktop rail: Ticket, Safety note, About link
│   ├── map/
│   │   └── TransitMap.tsx      # Dynamic Leaflet component with sepia tiles and brass pins
│   ├── masthead/
│   │   ├── Masthead.tsx        # Nameplate in Playfair, engraved railway crest, date line
│   │   └── ThemeToggle.tsx     # Sun/Flame theme switcher
│   ├── nav/
│   │   └── ClassicNav.tsx      # Desktop top bar, mobile bottom bar with ink indicator
│   └── ui/
│       ├── DoubleRule.tsx      # 3px + 1px Victorian rule
│       └── Fleuron.tsx         # Typographic ornaments (❦, ❧, ※)
├── lib/
│   ├── supabase.ts           # Typed client supporting NEXT_PUBLIC_ and legacy VITE_ env vars
│   ├── queries.ts            # TanStack Query hooks with optimistic updates and rollbacks
│   ├── moderation.ts         # checkText abuse filter and crisis detection
│   ├── moderation.test.ts    # Vitest unit tests for moderation
│   ├── streak.ts             # Local date calculations, missed-day reset, streak bump
│   ├── streak.test.ts        # Vitest unit tests for streak
│   ├── status.ts             # statusByRoute 60-min window calculation and timeAgo
│   ├── status.test.ts        # Vitest unit tests for statusByRoute
│   ├── device.ts             # Anonymous UUID generator
│   ├── themeConstants.ts     # Heritage line colors and status metadata
│   └── fonts.ts              # next/font configurations
└── types/
    └── database.ts           # Strict TypeScript interfaces
```

---

## Setup & Running

### 1. Environment Configuration

Copy `.env.example` to `.env` and insert your Supabase project credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Legacy Vite variable names are also supported automatically:
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

The app will start at `http://localhost:3000`.

### 4. Run Quality Checks & Tests

```bash
# Run strict TypeScript type check
npm run check

# Run Vitest unit tests
npm run test

# Run Next.js production build
npm run build
```

---

## Database & Backend Schema

The Supabase database schema (`supabase/schema.sql`) contains tables for `routes`, `stations`, `posts`, `reactions`, `comments`, and `reports`, protected by Row Level Security (RLS) and the `handle_report()` trigger which automatically hides any item receiving 3 community reports.
