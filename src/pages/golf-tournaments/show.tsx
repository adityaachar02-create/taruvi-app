import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useOne } from "@refinedev/core";
import { EditButton } from "@refinedev/mui";
import { useParams } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import { GolfStatusChip } from "../../components/golf/GolfStatusChip";
import type { GolfTournament } from "../../types/golf";
import { getScoreSourceLabel } from "../../utils/golfDraft";

export const GolfTournamentShow = () => {
  const { id = "" } = useParams();
  const { result: tournament, query } = useOne<GolfTournament>({ resource: "golf_tournaments", id });

  if (query.isLoading) {
    return (
      <Stack sx={{ minHeight: "60vh" }} alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <GolfPage
      title={tournament?.name || "Tournament"}
      subtitle={`${tournament?.venue || "Venue TBD"} • ${tournament?.season ?? "Season TBD"}`}
      actions={<EditButton resource="golf_tournaments" recordItemId={id}>Edit Tournament</EditButton>}
    >
      <GolfSection title="Tournament Profile" action={tournament ? <GolfStatusChip status={tournament.status} /> : null}>
        <Stack spacing={1}>
          <Typography>Starts: {tournament?.starts_on || "Not set"}</Typography>
          <Typography>Ends: {tournament?.ends_on || "Not set"}</Typography>
          <Typography>Managers: {tournament?.draft_size ?? 0}</Typography>
          <Typography>Picks per manager: {tournament?.picks_per_manager ?? 0}</Typography>
          <Typography>Score source: {tournament ? getScoreSourceLabel(tournament.score_source) : "—"}</Typography>
          <Typography>External key: {tournament?.external_tournament_key || "Not set"}</Typography>
          <Typography>Refresh cadence: {tournament?.auto_refresh_seconds ?? "Off"} seconds</Typography>
          <Typography>Last synced: {tournament?.last_synced_at || "Never"}</Typography>
          <Typography>Sync status: {tournament?.sync_status || "idle"}</Typography>
          <Typography>Sync message: {tournament?.sync_message || "No sync activity yet."}</Typography>
          <Typography>Active: {tournament?.is_active ? "Yes" : "No"}</Typography>
        </Stack>
      </GolfSection>
    </GolfPage>
  );
};
