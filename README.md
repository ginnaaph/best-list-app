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
- **State:** Zustand
- **Build & Deployment:** EAS (development, preview, production profiles)
- **Crash Reporting:** Sentry
- **IDE:** VS Code

## Environment Variables
Create a local `.env` file from the example template before running the app:
```bash
cp .env.example .env
```

Set these Supabase values in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL` — your Supabase project URL.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon key used by the Expo client.

You can find both values in your Supabase project settings under API configuration. Restart the Expo dev server after changing environment variables.

## Screens

### Onboarding & Auth
- **Splash** — app logo, tap to enter
- **Onboarding** — carousel walkthrough (food ranking concept)
- **How It Works** — explainer before sign-in
- **Sign In / Sign Up** — Google OAuth + Apple Sign-In
- **Setup Handle** — public username for shareable lists

### Core App
- **Home** — category grid with entry counts; tap to view ranked list or create new category
- **Add Category** — name + emoji, create new food type
- **Ranked List** — entries sorted by composite score; auto-ranked by weighted dimensions (taste, value, portion, vibe)
- **Add Entry** — photo capture, location, multi-slider scoring, notes
- **Entry Detail** — full score breakdown, notes, edit/delete actions
- **Edit Entry** — modify any field or delete entry

### Social & Sharing
- **Shareable List** — read-only public view of ranked category; shows owner @handle; non-owners see App Store waitlist signup CTA
- **Profile** — view user stats, created categories, account info

### Account Management
- **Settings** — edit profile, change password, delete account (3-step confirmation flow)
- **Edit Profile** — name, bio, profile photo

### Support & Legal
- **Contact Us** — Formspree contact form
- **Report a Bug** — in-app bug reporter (sends to Sentry)
- **Privacy Policy** — full disclosure of crash reporting + bug data collection
- **Terms of Service** — standard TOS
- **Credits** — photo/asset attribution
