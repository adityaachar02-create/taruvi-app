import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useList, useOne } from "@refinedev/core";
import { useParams } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import type { GolfDraftPick, GolfGolfer, GolfManager, GolfTournament } from "../../types/golf";
import { getEntityId } from "../../utils/golfDraft";

export const GolfDraftPickShow = () => {
  const { id = "" } = useParams();
  const { result: pick, query } = useOne<GolfDraftPick>({
    resource: "golf_draft_picks",
    id,
  });
  const managersQuery = useList<GolfManager>({ resource: "golf_managers", pagination: { mode: "off" } });
  const golfersQuery = useList<GolfGolfer>({ resource: "golf_golfers", pagination: { mode: "off" } });
  const tournamentsQuery = useList<GolfTournament>({ resource: "golf_tournaments", pagination: { mode: "off" } });

  if (query.isLoading || managersQuery.query.isLoading || golfersQuery.query.isLoading || tournamentsQuery.query.isLoading) {
    return (
      <Stack sx={{ minHeight: "60vh" }} alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  const manager = managersQuery.result?.data?.find((item) => item.id === getEntityId(pick?.manager_id ?? ""));
  const golfer = golfersQuery.result?.data?.find((item) => item.id === getEntityId(pick?.golfer_id ?? ""));
  const tournament = tournamentsQuery.result?.data?.find((item) => item.id === getEntityId(pick?.tournament_id ?? ""));

  return (
    <GolfPage title={`Pick #${pick?.pick_number ?? "—"}`} subtitle="Detailed pick metadata for audit and review.">
      <GolfSection title="Draft Pick Details">
        <Stack spacing={1}>
          <Typography>Manager: {manager?.display_name || "Unknown"}</Typography>
          <Typography>Golfer: {golfer?.full_name || "Unknown"}</Typography>
          <Typography>Tournament: {tournament?.name || "Unknown"}</Typography>
          <Typography>Round: {pick?.round_number ?? "—"}</Typography>
          <Typography>Direction: {pick?.draft_direction || "—"}</Typography>
          <Typography>Picked at: {pick?.picked_at || "—"}</Typography>
        </Stack>
      </GolfSection>
    </GolfPage>
  );
};
