import type {
  DraftSlot,
  GolfDraftPick,
  GolfGolfer,
  GolfManager,
  GolfPoolSettings,
  GolfScore,
  LeaderboardTiebreaker,
  ScoreSource,
  TeamLeaderboardEntry,
  TournamentStatus,
} from "../types/golf";

type MaybePopulated<T extends { id: string }> = string | T;
export const MISSED_CUT_PENALTY = 10;

export const getEntityId = <T extends { id: string }>(value: MaybePopulated<T>) =>
  typeof value === "string" ? value : value.id;

export const getEntityRecord = <T extends { id: string }>(value: MaybePopulated<T>) =>
  (typeof value === "string" ? null : value);

export const formatToPar = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "Pending";
  }

  if (value === 0) {
    return "E";
  }

  return value > 0 ? `+${value}` : `${value}`;
};

export const getEffectiveScoreToPar = (score?: Pick<GolfScore, "to_par" | "is_cut"> | null) => {
  if (!score) {
    return null;
  }

  const baseScore = typeof score.to_par === "number" ? score.to_par : null;

  if (score.is_cut) {
    return (baseScore ?? 0) + MISSED_CUT_PENALTY;
  }

  return baseScore;
};

export const normalizeManagers = (managers: GolfManager[]) =>
  [...managers]
    .sort((a, b) => a.draft_slot - b.draft_slot)
    .map((manager, index) => ({
      ...manager,
      draft_slot: index + 1,
    }));

export const buildSnakeDraftSlots = (managers: GolfManager[], picksPerManager: number): DraftSlot[] => {
  const orderedManagers = normalizeManagers(managers);
  const slots: DraftSlot[] = [];

  for (let round = 1; round <= picksPerManager; round += 1) {
    const draftDirection = round % 2 === 1 ? "forward" : "reverse";
    const roundManagers =
      draftDirection === "forward" ? orderedManagers : [...orderedManagers].reverse();

    roundManagers.forEach((manager, index) => {
      slots.push({
        pickNumber: slots.length + 1,
        roundNumber: round,
        slotInRound: index + 1,
        draftDirection,
        manager,
      });
    });
  }

  return slots;
};

export const buildLeaderboard = (
  managers: GolfManager[],
  picks: GolfDraftPick[],
  scores: GolfScore[],
  tiebreaker: LeaderboardTiebreaker = "total_to_par",
): TeamLeaderboardEntry[] => {
  const scoreMap = new Map<string, GolfScore>(
    scores.map((score) => [getEntityId(score.golfer_id), score]),
  );

  return normalizeManagers(managers)
    .map((manager) => {
      const teamPicks = picks
        .filter((pick) => getEntityId(pick.manager_id) === manager.id)
        .sort((a, b) => a.pick_number - b.pick_number);

      const teamScores = teamPicks
        .map((pick) => getEffectiveScoreToPar(scoreMap.get(getEntityId(pick.golfer_id))))
        .filter((value): value is number => typeof value === "number");

      return {
        manager,
        picks: teamPicks,
        totalToPar: teamScores.length ? teamScores.reduce((sum, value) => sum + value, 0) : null,
        scoredGolfers: teamScores.length,
        rosterSize: teamPicks.length,
      };
    })
    .sort((left, right) => {
      if (left.totalToPar === null && right.totalToPar === null) {
        return left.manager.draft_slot - right.manager.draft_slot;
      }

      if (left.totalToPar === null) {
        return 1;
      }

      if (right.totalToPar === null) {
        return -1;
      }

      if (left.totalToPar !== right.totalToPar) {
        return left.totalToPar - right.totalToPar;
      }

      if (tiebreaker === "scored_golfers" && left.scoredGolfers !== right.scoredGolfers) {
        return right.scoredGolfers - left.scoredGolfers;
      }

      return left.manager.draft_slot - right.manager.draft_slot;
    });
};

export const getAvailableGolfers = (golfers: GolfGolfer[], picks: GolfDraftPick[]) => {
  const draftedIds = new Set(picks.map((pick) => getEntityId(pick.golfer_id)));

  return golfers
    .filter((golfer) => !draftedIds.has(golfer.id))
    .sort((a, b) => (a.world_rank ?? 999) - (b.world_rank ?? 999));
};

export const getNextDraftSlot = (
  managers: GolfManager[],
  picksPerManager: number,
  currentPickCount: number,
) => buildSnakeDraftSlots(managers, picksPerManager)[currentPickCount] ?? null;

export const getTournamentStatusLabel = (status: TournamentStatus) => {
  switch (status) {
    case "setup":
      return "Setup";
    case "draft_live":
      return "Draft Live";
    case "in_progress":
      return "In Progress";
    case "final":
      return "Final";
    default:
      return status;
  }
};

export const getTournamentStatusDescription = (status: TournamentStatus) => {
  switch (status) {
    case "setup":
      return "Configure the field, managers, and pool settings before the draft opens.";
    case "draft_live":
      return "The commissioner can make live picks and fill out every roster spot.";
    case "in_progress":
      return "Drafting is complete and scoring updates now drive the standings.";
    case "final":
      return "The major is complete and the standings are locked.";
    default:
      return "";
  }
};

export const getTiebreakerLabel = (value: LeaderboardTiebreaker) => {
  switch (value) {
    case "total_to_par":
      return "Lowest team score to par";
    case "scored_golfers":
      return "More scored golfers";
    case "draft_slot":
      return "Earlier draft slot";
    default:
      return value;
  }
};

export const isLiveScoreSource = (value: ScoreSource) =>
  value === "sample_masters_live" || value === "pga_tour_live";

export const getScoreSourceLabel = (value: ScoreSource) => {
  switch (value) {
    case "manual":
      return "Manual";
    case "sample_masters_live":
      return "Sample Masters Live";
    case "pga_tour_live":
      return "PGA TOUR Live";
    default:
      return value;
  }
};

export const getDraftCompletion = (managers: GolfManager[], picksPerManager: number, picks: GolfDraftPick[]) => {
  const totalSlots = normalizeManagers(managers).length * picksPerManager;

  return {
    totalSlots,
    picksMade: picks.length,
    picksRemaining: Math.max(totalSlots - picks.length, 0),
    completionRate: totalSlots ? Math.round((picks.length / totalSlots) * 100) : 0,
  };
};

export const countEnteredScores = (scores: GolfScore[]) =>
  scores.filter((score) => typeof getEffectiveScoreToPar(score) === "number").length;

export const getPoolName = (settings?: GolfPoolSettings | null) =>
  settings?.pool_name?.trim() || "Fantasy Golf Club";
