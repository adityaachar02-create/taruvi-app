import { useDeleteMany, useInvalidate } from "@refinedev/core";

const buildDeleteByTournamentMeta = (tournamentId: string) => ({
  deleteByFilter: true,
  filters: [{ field: "tournament_id", operator: "eq" as const, value: tournamentId }],
});

export const useResetTournamentData = () => {
  const { mutate: deleteMany, mutation } = useDeleteMany();
  const invalidate = useInvalidate();

  const deleteByTournament = (resource: "golf_draft_picks" | "golf_scores", tournamentId: string) =>
    new Promise<void>((resolve, reject) => {
      deleteMany(
        {
          resource,
          ids: [],
          meta: buildDeleteByTournamentMeta(tournamentId),
        },
        {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        },
      );
    });

  const resetTournamentData = async (tournamentId: string) => {
    await deleteByTournament("golf_draft_picks", tournamentId);
    await deleteByTournament("golf_scores", tournamentId);

    await Promise.all([
      invalidate({ resource: "golf_draft_picks", invalidates: ["resourceAll"] }),
      invalidate({ resource: "golf_scores", invalidates: ["resourceAll"] }),
    ]);
  };

  return {
    resetTournamentData,
    isResetting: mutation.isPending,
  };
};
