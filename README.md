# BestList 
## What it is
A personal food ranking app for iOS. Log dishes you've tried at specific restaurants, score them, and the app automatically ranks them. Think Letterboxd for food — but dish-specific, not restaurant-specific. Your own private food memory book you can share when someone asks "where's the best breakfast burrito?"

## Problem it solves
You try a great dish, forget where it was, can't remember how it compared to the last one. BestList is the external memory — log it once, find it forever.

## Core MVP 
1. **Categories** — create a named list (e.g. "Breakfast Burrito", "Ramen")
2. **Entries** — add a dish to a category with: place name, city, optional photo, composite score, optional note
3. **Ranking** — entries auto-sort by overall score. Re-sortable by individual dimension (taste / value / portion / vibe)
4. **Shareable link** — toggle a category public, share a read-only link

## Weighted Scoring
Each entry is scored across 4 dimensions:
- **Taste** — how good was it?
- **Value** — worth the price?
- **Portion** — how filling?
- **Vibe** — ambiance, service, experience?

Overall score is auto-calculated. User can re-sort any list by any single dimension (e.g. "cheapest burrito" = sort by value).

## Tech Stack
- **Framework:** React Native + Expo
- **Styling:** NativeWind (Tailwind for RN)
- **Backend/DB/auth:** Supabase
- **IDE:** VS Code
- **Testing:** Expo Go

## Environment Variables
Create a local `.env` file from the example template before running the app:

```bash
cp .env.example .env
```

Set these Supabase values in `.env`:

- `EXPO_PUBLIC_SUPABASE_URL` — your Supabase project URL.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon key used by the Expo client.

You can find both values in your Supabase project settings under API configuration. Restart the Expo dev server after changing environment variables.

## Screens (MVP)
1. Home — category grid tiles
2. Category / Ranked List — ranked entry cards, sortable
3. Add Entry — photo + place + composite score sliders + note
4. Entry Detail — full view with score breakdown
5. Shareable List — read-only public view
6. Profile - user stats and categories
