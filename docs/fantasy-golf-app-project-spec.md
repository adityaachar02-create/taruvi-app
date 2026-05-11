## Fantasy Golf App Project Spec

### Goal

Turn the Taruvi Refine template into a functional fantasy golf MVP for a friends-only pool, with live Taruvi-backed data and commissioner-friendly configuration.

### Existing App Context

- Frontend stack: React 19, Refine v5, MUI 7, `@taruvi/refine-providers`
- Existing golf datatables already present:
  - `golf_tournaments`
  - `golf_managers`
  - `golf_golfers`
  - `golf_draft_picks`
  - `golf_scores`
- Existing seed data already present:
  - 1 active tournament
  - 16 managers
  - 40 golfers
  - no draft picks yet
  - no score rows yet
- Existing helper code already present:
  - `src/types/golf.ts`
  - `src/utils/golfDraft.ts`
  - `src/hooks/useActiveTournament.ts`

### MVP Scope

- Dashboard with live tournament overview, next pick, leaderboard, and quick actions
- Draft board for commissioner-driven snake draft execution
- Resource CRUD for tournaments, managers, golfers, scores, and pool settings
- Live roster and golfer views backed by Taruvi data
- Configurable pool settings exposed in the app UI

### Data Work

- Add `golf_pool_settings` datatable for app-level configuration
- Seed one settings row
- Seed initial `golf_scores` rows for the active tournament so scoring screens are immediately usable
- Extend `golf_tournaments.score_source` to support `pga_tour_live`
- Store the official PGA TOUR leaderboard id in `external_tournament_key` for live tournaments
- Sync official leaderboard rows into `golf_scores` through the `sync-golf-live-scores` Taruvi app function

### Frontend Work

- Register Refine resources in `src/App.tsx`
- Add resource routes for:
  - `golf_tournaments`
  - `golf_managers`
  - `golf_golfers`
  - `golf_scores`
  - `golf_pool_settings`
- Add custom pages/routes for:
  - dashboard `/`
  - draft board `/draft`
  - roster view `/managers`
- Replace the current placeholder home screen with a real golf dashboard

### UX Direction

- Preserve the project’s current visual language instead of inventing a new design system
- Favor clear operational UI for commissioner tasks over decorative complexity
- Keep the app functional first, with responsive layouts and concise status indicators

### Risks And Notes

- The repo does not contain explicit saved design context, so this pass will stay close to existing styling patterns
- Taruvi tables already exist, so schema work must be additive and safe
- Draft picks should primarily be created through the draft board, even if list/show access exists elsewhere
- Official PGA TOUR syncing currently reads the live payload embedded in `https://www.pgatour.com/leaderboard`
- Name matching is roster-based, so unmatched PGA TOUR names should be reviewed when the local golfer field changes
