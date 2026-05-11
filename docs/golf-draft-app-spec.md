# Golf Draft App MVP Spec

## Goal

Build a functional app for a friends-only Major championship golf draft that:

- supports a snake-style draft for 16 managers with 2 picks each
- tracks golfers drafted to each manager
- stores tournament scoring and standings
- shows a live leaderboard ranked by each manager's combined golfer score

This MVP is optimized for one active major at a time, while keeping the data model reusable for future majors.

## Users

- Commissioner: sets up the tournament, draft order, and enters leaderboard updates
- Managers: view draft order, available golfers, drafted teams, and current standings

## Core MVP Flows

1. Commissioner opens the dashboard and sees the active tournament, current draft status, and leaderboard.
2. Commissioner uses the draft board to make picks in snake order.
3. Managers can see which golfers are still available and whose turn is next.
4. Commissioner updates golfer tournament scores as the major progresses.
5. The leaderboard refreshes from live data and ranks managers by total team score.

## Data Model

### `golf_tournaments`

- one row per major tournament
- fields:
  - `id` uuid primary key
  - `name`
  - `season`
  - `venue`
  - `status` enum: `setup | draft_live | in_progress | final`
  - `starts_on`
  - `ends_on`
  - `draft_size`
  - `picks_per_manager`
  - `is_active`

### `golf_managers`

- one row per friend participating in the pool
- fields:
  - `id` uuid primary key
  - `display_name`
  - `draft_slot`
  - `color_hex`
  - `is_commissioner`

### `golf_golfers`

- golfer master list for the tournament field
- fields:
  - `id` uuid primary key
  - `full_name`
  - `country`
  - `world_rank`
  - `seed_tier`
  - `is_active`

### `golf_draft_picks`

- one record per pick made during the draft
- fields:
  - `id` uuid primary key
  - `tournament_id` fk to `golf_tournaments`
  - `manager_id` fk to `golf_managers`
  - `golfer_id` fk to `golf_golfers`
  - `pick_number`
  - `round_number`
  - `slot_in_round`
  - `draft_direction` enum: `forward | reverse`
  - `picked_at`

- constraints:
  - unique `tournament_id + golfer_id`
  - unique `tournament_id + pick_number`

### `golf_scores`

- one scoring row per golfer per tournament
- fields:
  - `id` uuid primary key
  - `tournament_id` fk to `golf_tournaments`
  - `golfer_id` fk to `golf_golfers`
  - `position_label`
  - `to_par`
  - `thru`
  - `today_score`
  - `strokes`
  - `is_cut`
  - `updated_at`

- constraints:
  - unique `tournament_id + golfer_id`

## Seed Data

Seed one sample tournament and enough data to make the app usable immediately:

- 1 active tournament
- 16 managers
- 40 golfers
- no draft picks initially, so the commissioner can run the draft live
- initial empty score rows are optional for MVP and can be created as updates happen

## UI Structure

### Dashboard `/`

- active tournament hero
- current draft status
- next pick indicator
- leaderboard cards and standings table
- quick links into draft board and scoring

### Draft Board `/draft`

- snake draft timeline for 32 total picks
- available golfers list
- drafted teams grouped by manager
- commissioner action to make the next pick

### Managers `/managers`

- roster view with each manager and drafted golfers

### Golfers `/golfers`

- golfer field table with availability, rank, and current score

### Scores `/scores`

- scoring admin table for entering or editing golfer positions and scores

## Technical Notes

- Use Taruvi datatables via the default Refine provider for all CRUD.
- Use Refine v5 hook return shapes only.
- Prefer aggregated queries for leaderboard and summary widgets.
- Use the existing Refine notification provider for success and error feedback.

## Files Expected To Change

- `src/App.tsx`
- `src/pages/home/index.tsx`
- new resource pages under `src/pages/`
- new shared UI helpers under `src/components/` or `src/utils/`
