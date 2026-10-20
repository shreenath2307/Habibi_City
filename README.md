# Habibi City

*Transit Signage meets Risograph Zine* — an anonymous, route-by-route community dispatch app for city commuters.

---

## Art Direction & Visual Language

- **Transit Signage & Departure Aesthetics**: Bold line colors, route indicators, station dots, split-flap / scrolling departure-board tickers, and monospace timetables.
- **Risograph Zine Print Texture**: Paper grain noise overlay, subtle print misregistration shadows on hero signage, ticket perforations, and punch-card stamp slots.
- **Dynamic Solar Skyline**: Canvas-driven parallax city skyline that synchronizes with the user's local solar time (Dawn, Day, Sunset/Dusk, Midnight) with desktop cursor tracking and mobile scroll parallax.
- **Dual Day & Night System**: High-contrast warm recycled newsprint (`#F5F2EB`) by day and deep subway tunnel ink (`#0E0F13`) by night, automatically following system `prefers-color-scheme`.

---

## Signature Interactions

1. **Procedural Local-Time Skyline Hero**: Canvas vector skyline with stars, moon/sun, animated elevated metro train, and architectural silhouettes shifting colors based on local clock hours.
2. **Live Metro Schematic Diagram**: Interactive subway diagram where station nodes pulse in real time with line status colors (delay, crowding, safety, all clear) and line tracks animate in on mount.
3. **Split-Flap Departure Ticker**: Real-time ticker ribbon at the top of every screen streaming the latest community reports.
4. **Collectible Commuter Punch Card**: Retro punch-card ticket tracking daily streaks with physical stamp animations, haptic taps, and risograph confetti/ink-splatter explosions at 3, 7, and 30-day milestones.
5. **Interactive Post Cards**: Colored left edge spine corresponding to route line, double-tap & hold heart bursts for likes, swipe gesture revealing the Report action, pointer spotlight highlight on desktop, and spring-expanding comment trays.
6. **Tactile Sticker Compose (Write Screen)**: Tag selectors styled as punchy tactile stickers, dynamic card tinting matching the active tag, circular SVG progress ring tracking 280 characters, and ticket-ejection submit animation.
7. **Folded Envelope Letters**: Unsent letters to the city styled as air-mail stationery that unfold on tap into literary `Instrument Serif` typography, with background drifting paper planes and destination boarding tabs.
8. **Transit Geometry Map**: Custom pulsing SVG station pins, CARTO Positron/Dark basemap matching the active color theme, smooth fly-to camera on station click, and arrival manifest popups.
9. **Floating Pill Navigation**: Bottom on mobile, top-centered on desktop with an animated spring active indicator and mobile haptic ticks (`navigator.vibrate`).
10. **Desktop Spotlight & Cursor**: Trailing ring cursor and pointer spotlight on cards that automatically disable on touch devices (`@media (hover: hover) and (pointer: fine)`).

---

## File Structure

```
Habibi_City-main/
├── src/
│   ├── lib.js                      # Untouched data logic, moderation (checkText), Supabase queries, streak logic
│   ├── theme.js                    # Deterministic 5-line palette, status metadata, and haptic utilities
│   ├── index.css                   # Custom design tokens, typography, riso paper grain, and responsive layout
│   ├── components/
│   │   ├── DepartureTicker.jsx     # Scrolling live dispatch ribbon
│   │   ├── SkylineHero.jsx         # Procedural solar sky + parallax skyline canvas
│   │   ├── PunchCardStreak.jsx     # Collectible commuter punch card & ink celebration
│   │   ├── MetroStatusBoard.jsx    # Live schematic metro diagram with pulsing nodes
│   │   ├── PostCard.jsx            # Line-spine card with double-tap heart burst & swipe-to-report
│   │   └── DesktopCursor.jsx       # Fine-pointer trailing ring cursor
│   ├── screens/
│   │   ├── WriteScreen.jsx         # Tactile sticker compose with character gauge & ticket print
│   │   ├── LettersScreen.jsx       # Folded airmail envelopes & drifting planes
│   │   └── MapScreen.jsx           # CARTO theme tiles, pulsing SVG pins & smooth fly-to
│   ├── App.jsx                     # Shell, tab orchestration, and shared layout animations
│   ├── main.jsx                    # Entry point
│   ├── components.jsx              # Re-export bridge for modular components
│   └── screens.jsx                 # Re-export bridge for modular screens
└── package.json
```

---

## Dependencies

### New Dependencies Added
- **`motion` (`^12.x`)**: Lightweight, high-performance animation engine for React 19 powering shared-layout tab transitions, spring gestures, ticket stamp animations, and card reveals.

### Existing Core Dependencies
- `react` & `react-dom` (`^19.2.x`)
- `@supabase/supabase-js` (`^2.118.x`)
- `leaflet` (`^1.9.4`) & `react-leaflet` (`^5.0.0`)
- `vite` (`^8.3.x`)
- `oxlint` (`^1.81.x`)

*Note: The external Bootstrap 5.3 CDN was removed and replaced with clean, zero-bloat custom design tokens in `src/index.css`.*

---

## Setup & Running

1. Populate your Supabase credentials in `.env`:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Verify linter and production build:
   ```bash
   npm run lint
   npm run build
   ```

---

## Privacy & Identity

Habibi City remains completely anonymous:
- No accounts, logins, or tracking cookies.
- No GPS / geolocation APIs (stations are chosen manually or explored via static map pins).
- Device identity is a randomized local UUID stored solely in `localStorage` to prevent duplicate likes and track spam reports.
- All community text passes through automated moderation and crisis helpline detection.
