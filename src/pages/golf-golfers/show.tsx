import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useList, useOne } from "@refinedev/core";
import { EditButton } from "@refinedev/mui";
import { useParams } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import { ScoreToParText } from "../../components/golf/ScoreToParText";
import type { GolfDraftPick, GolfGolfer, GolfManager, GolfScore } from "../../types/golf";
import { getEffectiveScoreToPar, getEntityId } from "../../utils/golfDraft";

export const GolfGolferShow = () => {
  const { id = "" } = useParams();
  const { result: golfer, query } = useOne<GolfGolfer>({ resource: "golf_golfers", id });
  const picksQuery = useList<GolfDraftPick>({
    resource: "golf_draft_picks",
    pagination: { mode: "off" },
    filters: [{ field: "golfer_id", operator: "eq", value: id }],
  });
  const scoresQuery = useList<GolfScore>({
    resource: "golf_scores",
    pagination: { mode: "off" },
    filters: [{ field: "golfer_id", operator: "eq", value: id }],
  });
  const managersQuery = useList<GolfManager>({ resource: "golf_managers", pagination: { mode: "off" } });

  if (query.isLoading || picksQuery.query.isLoading || scoresQuery.query.isLoading || managersQuery.query.isLoading) {
    return (
      <Stack sx={{ minHeight: "60vh" }} alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  const latestPick = picksQuery.result?.data?.[0] ?? null;
  const latestScore = scoresQuery.result?.data?.[0] ?? null;
  const draftedBy = managersQuery.result?.data?.find((manager) => manager.id === getEntityId(latestPick?.manager_id ?? ""));

  return (
    <GolfPage
      title={golfer?.full_name || "Golfer"}
      subtitle={`${golfer?.country || "Country TBD"} • world rank #${golfer?.world_rank ?? "—"}`}
      actions={<EditButton resource="golf_golfers" recordItemId={id}>Edit Golfer</EditButton>}
    >
      <GolfSection title="Field Details">
        <Stack spacing={1}>
          <Typography>Tier: {golfer?.seed_tier || "Unassigned"}</Typography>
          <Typography>Status: {golfer?.is_active ? "Active" : "Inactive"}</Typography>
          <Typography>Drafted by: {draftedBy?.display_name || "Available"}</Typography>
          <Stack direction="row" spacing={0.75} alignItems="baseline">
            <Typography>Current score:</Typography>
            <ScoreToParText value={getEffectiveScoreToPar(latestScore)} />
          </Stack>
        </Stack>
      </GolfSection>
    </GolfPage>
  );
};
