import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useList, useOne } from "@refinedev/core";
import { EditButton } from "@refinedev/mui";
import { useParams } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import { ScoreToParText } from "../../components/golf/ScoreToParText";
import type { GolfDraftPick, GolfGolfer, GolfManager, GolfScore } from "../../types/golf";
import { buildLeaderboard, getEntityId } from "../../utils/golfDraft";

export const GolfManagerShow = () => {
  const { id = "" } = useParams();
  const { result: manager, query } = useOne<GolfManager>({ resource: "golf_managers", id });
  const picksQuery = useList<GolfDraftPick>({
    resource: "golf_draft_picks",
    pagination: { mode: "off" },
    filters: [{ field: "manager_id", operator: "eq", value: id }],
    sorters: [{ field: "pick_number", order: "asc" }],
  });
  const golfersQuery = useList<GolfGolfer>({ resource: "golf_golfers", pagination: { mode: "off" } });
  const managersQuery = useList<GolfManager>({ resource: "golf_managers", pagination: { mode: "off" } });
  const scoresQuery = useList<GolfScore>({ resource: "golf_scores", pagination: { mode: "off" } });

  if (query.isLoading || picksQuery.query.isLoading || golfersQuery.query.isLoading || managersQuery.query.isLoading || scoresQuery.query.isLoading) {
    return (
      <Stack sx={{ minHeight: "60vh" }} alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  const picks = picksQuery.result?.data ?? [];
  const golfers = golfersQuery.result?.data ?? [];
  const golfersById = new Map(golfers.map((golfer) => [golfer.id, golfer]));
  const leaderboard = buildLeaderboard(managersQuery.result?.data ?? [], picksQuery.result?.data ?? [], scoresQuery.result?.data ?? []);
  const managerStanding = leaderboard.find((entry) => entry.manager.id === manager?.id);

  return (
    <GolfPage
      title={manager?.display_name || "Manager"}
      subtitle={`Draft slot ${manager?.draft_slot ?? "—"} • ${manager?.is_commissioner ? "Commissioner" : "Manager"}`}
      actions={<EditButton resource="golf_managers" recordItemId={id}>Edit Manager</EditButton>}
    >
      <GolfSection title="Profile">
        <Stack spacing={1}>
          <Typography>Color: {manager?.color_hex || "Not set"}</Typography>
          <Stack direction="row" spacing={0.75} alignItems="baseline">
            <Typography>Team total:</Typography>
            <ScoreToParText value={managerStanding?.totalToPar ?? null} />
          </Stack>
          <Typography>Scored golfers: {managerStanding?.scoredGolfers ?? 0}</Typography>
        </Stack>
      </GolfSection>
      <GolfSection title="Roster">
        <Stack spacing={1.5}>
          {picks.length ? (
            picks.map((pick) => (
              <Paper key={pick.id} elevation={0} sx={{ p: 2, borderRadius: 1, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {golfersById.get(getEntityId(pick.golfer_id))?.full_name || "Unknown golfer"}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Pick #{pick.pick_number} • round {pick.round_number}
                </Typography>
              </Paper>
            ))
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No golfers drafted yet.
            </Typography>
          )}
        </Stack>
      </GolfSection>
    </GolfPage>
  );
};
