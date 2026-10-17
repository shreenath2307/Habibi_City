# Habibi City

Anonymous route posts, unsent letters to the city, and a commute streak — for commuters on their phones.

## Setup (manual steps for you)

1. Put your existing Supabase project's keys in `.env`:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

   (Supabase dashboard → Project Settings → API. The anon key is safe in a frontend; RLS protects the data.)

2. `npm install`
3. `npm run dev` → http://localhost:5173

The app shows a setup banner until both keys are present. Restart the dev server after editing `.env`.

Tables, RLS policies, the report trigger, and seed rows are assumed to already exist in the project
(`routes`, `stations`, `posts`, `reactions`, `comments`, `reports`).

## Files

- `src/lib.js` — Supabase client, device id, streak, moderation, all queries
- `src/App.jsx` — app shell, Feed screen, status board wiring
- `src/components.jsx` — hero, status board, post card (likes / comments / report)
- `src/screens.jsx` — Write, Letters, Map screens
- `src/index.css` — design system

## Identity and privacy

No accounts. A random UUID is stored in `localStorage` as `device_id` and used only to enforce one
like per post and to attach reports. No names, emails, IPs, or GPS coordinates are collected.
