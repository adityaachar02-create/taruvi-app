import { useInvalidate, useNotification } from "@refinedev/core";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { GolfTournament } from "../types/golf";
import { executeFunction } from "../utils/functionHelpers";
import { getScoreSourceLabel, isLiveScoreSource } from "../utils/golfDraft";

interface SyncResult {
  success?: boolean;
  error?: string;
  snapshot?: {
    index: number;
    label: string;
  };
  synced_count?: number;
}

interface RunSyncOptions {
  advance?: boolean;
  silent?: boolean;
  reason?: string;
}

interface UseGolfLiveSyncOptions {
  enableAutoSync?: boolean;
}

export const useGolfLiveSync = (
  activeTournament: GolfTournament | null,
  options?: UseGolfLiveSyncOptions,
) => {
  const invalidate = useInvalidate();
  const { open } = useNotification();
  const [isSyncing, setIsSyncing] = useState(false);
  const syncInFlightRef = useRef(false);
  const sourceLabel = activeTournament ? getScoreSourceLabel(activeTournament.score_source) : "Live scores";

  const runSync = useEffectEvent(async (options?: RunSyncOptions) => {
    if (!activeTournament || !isLiveScoreSource(activeTournament.score_source)) {
      return null;
    }

    if (syncInFlightRef.current) {
      return null;
    }

    syncInFlightRef.current = true;
    setIsSyncing(true);

    try {
      const result = await executeFunction<SyncResult>("sync-golf-live-scores", {
        tournament_id: activeTournament.id,
        advance: options?.advance ?? true,
        reason: options?.reason ?? "manual",
      });

      await Promise.all([
        invalidate({ resource: "golf_tournaments", invalidates: ["resourceAll"] }),
        invalidate({ resource: "golf_scores", invalidates: ["resourceAll"] }),
      ]);

      if (!options?.silent) {
        if (result?.success) {
          open?.({
            type: "success",
            message: `${sourceLabel} synced`,
            description: result.snapshot
              ? `${result.snapshot.label} loaded with ${result.synced_count ?? 0} score updates.`
              : "The live leaderboard has been refreshed.",
          });
        } else {
          open?.({
            type: "error",
            message: "Sync failed",
            description: result?.error || "The live leaderboard could not be refreshed.",
          });
        }
      }

      return result;
    } catch (error) {
      if (!options?.silent) {
        open?.({
          type: "error",
          message: "Sync failed",
          description: error instanceof Error ? error.message : "The live leaderboard could not be refreshed.",
        });
      }

      return null;
    } finally {
      syncInFlightRef.current = false;
      setIsSyncing(false);
    }
  });

  useEffect(() => {
    if (
      options?.enableAutoSync === false ||
      !activeTournament ||
      !isLiveScoreSource(activeTournament.score_source) ||
      activeTournament.status !== "in_progress"
    ) {
      return undefined;
    }

    const refreshSeconds = Math.max(activeTournament.auto_refresh_seconds ?? 45, 15);

    void runSync({ advance: false, silent: true, reason: "hydrate" });

    const interval = window.setInterval(() => {
      void runSync({ advance: true, silent: true, reason: "poll" });
    }, refreshSeconds * 1000);

    return () => window.clearInterval(interval);
  }, [
    activeTournament?.id,
    activeTournament?.score_source,
    activeTournament?.status,
    activeTournament?.auto_refresh_seconds,
    options?.enableAutoSync,
    runSync,
  ]);

  return {
    isSyncing,
    runManualSync: () => runSync({ advance: true, silent: false, reason: "manual" }),
  };
};
