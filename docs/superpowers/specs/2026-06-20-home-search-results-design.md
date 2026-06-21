# Home Search Results Design

## Goal

Make the existing home `SearchPill` open a full-screen search modal that filters entries already loaded in the Zustand store.

## Behavior

- Tapping `SearchPill` opens a full-screen modal and focuses the search input.
- A non-empty query matches category name, place name, or city without regard to case.
- Results are ordered by calculated overall score from highest to lowest.
- Each row displays category name, place name, city, and overall rating.
- Tapping a row closes the modal and navigates to `/entry/[id]`.
- Clearing the query clears the result list. Closing the modal returns to the unchanged category grid.

## Architecture

`SearchPill` owns only modal visibility. `SearchResultsModal` owns query state, reads `entries` and `categories` directly from `useStore`, and renders results. A pure helper joins entries to category names, filters, and sorts the result records so the behavior can be tested independently.

No route, API, store, `HomeScreen`, or category-grid changes are required.

## Error and Empty States

- An empty query displays a short search prompt.
- A non-empty query with no matches displays a no-results message.
- Entries with a missing category remain searchable by place and city and display `Unknown category`.

## Verification

- Unit tests cover matching all three fields, case-insensitive matching, blank queries, missing categories, and score ordering.
- Run the focused test, Expo lint, TypeScript checking, and a diff review.
