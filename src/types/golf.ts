export type TournamentStatus = "setup" | "draft_live" | "in_progress" | "final";
export type DraftDirection = "forward" | "reverse";
export type LeaderboardTiebreaker = "total_to_par" | "scored_golfers" | "draft_slot";
export type ScoreSource = "manual" | "sample_masters_live" | "pga_tour_live";
export type SyncStatus = "idle" | "live" | "error";

export interface GolfTournament {
  id: string;
  name: string;
  season: number;
  venue?: string | null;
  status: TournamentStatus;
  starts_on?: string | null;
  ends_on?: string | null;
  draft_size: number;
  picks_per_manager: number;
  is_active: boolean;
  score_source: ScoreSource;
  external_tournament_key?: string | null;
  auto_refresh_seconds?: number | null;
  last_synced_at?: string | null;
  sync_status: SyncStatus;
  sync_message?: string | null;
  sync_cursor?: number | null;
}

export interface GolfManager {
  id: string;
  display_name: string;
  draft_slot: number;
  color_hex?: string | null;
  is_commissioner: boolean;
}

export interface GolfGolfer {
  id: string;
  full_name: string;
  country?: string | null;
  world_rank?: number | null;
  seed_tier?: string | null;
  is_active: boolean;
}

export interface GolfScore {
  id: string;
  tournament_id: string;
  golfer_id: string | GolfGolfer;
  position_label?: string | null;
  to_par?: number | null;
  thru?: string | null;
  today_score?: number | null;
  strokes?: number | null;
  is_cut: boolean;
  updated_at: string;
}

export interface GolfDraftPick {
  id: string;
  tournament_id: string | GolfTournament;
  manager_id: string | GolfManager;
  golfer_id: string | GolfGolfer;
  pick_number: number;
  round_number: number;
  slot_in_round: number;
  draft_direction: DraftDirection;
  picked_at: string;
}

export interface GolfPoolSettings {
  id: string;
  pool_name: string;
  tagline?: string | null;
  commissioner_name?: string | null;
  default_tournament_id?: string | GolfTournament | null;
  leaderboard_tiebreaker: LeaderboardTiebreaker;
  show_world_rank: boolean;
  show_country: boolean;
  allow_manual_scores: boolean;
  draft_clock_enabled: boolean;
  draft_clock_seconds?: number | null;
  highlight_seed_tiers: boolean;
}

export interface DraftSlot {
  pickNumber: number;
  roundNumber: number;
  slotInRound: number;
  draftDirection: DraftDirection;
  manager: GolfManager;
}

export interface TeamLeaderboardEntry {
  manager: GolfManager;
  picks: GolfDraftPick[];
  totalToPar: number | null;
  scoredGolfers: number;
  rosterSize: number;
}
