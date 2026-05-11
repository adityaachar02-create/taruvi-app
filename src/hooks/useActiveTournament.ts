import { useList } from "@refinedev/core";
import type { GolfTournament } from "../types/golf";

export const useActiveTournament = () => {
  const query = useList<GolfTournament>({
    resource: "golf_tournaments",
    filters: [{ field: "is_active", operator: "eq", value: true }],
    pagination: { mode: "off" },
  });

  return {
    ...query,
    activeTournament: query.result?.data?.[0] ?? null,
  };
};
