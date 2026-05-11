import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useList, useOne } from "@refinedev/core";
import { EditButton } from "@refinedev/mui";
import { useParams } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import type { GolfPoolSettings, GolfTournament } from "../../types/golf";
import { getTiebreakerLabel } from "../../utils/golfDraft";

export const GolfPoolSettingsShow = () => {
  const { id = "" } = useParams();
  const { result: setting, query } = useOne<GolfPoolSettings>({ resource: "golf_pool_settings", id });
  const tournamentsQuery = useList<GolfTournament>({ resource: "golf_tournaments", pagination: { mode: "off" } });

  if (query.isLoading || tournamentsQuery.query.isLoading) {
    return (
      <Stack sx={{ minHeight: "60vh" }} alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  const tournament = tournamentsQuery.result?.data?.find((item) => item.id === setting?.default_tournament_id);

  return (
    <GolfPage
      title={setting?.pool_name || "Pool Settings"}
      subtitle={setting?.tagline || "Pool configuration row"}
      actions={<EditButton resource="golf_pool_settings" recordItemId={id}>Edit Settings</EditButton>}
    >
      <GolfSection title="Configuration">
        <Stack spacing={1}>
          <Typography>Commissioner: {setting?.commissioner_name || "Not set"}</Typography>
          <Typography>Default tournament: {tournament?.name || "Not linked"}</Typography>
          <Typography>Tiebreaker: {setting ? getTiebreakerLabel(setting.leaderboard_tiebreaker) : "—"}</Typography>
          <Typography>Show world rank: {setting?.show_world_rank ? "Yes" : "No"}</Typography>
          <Typography>Show country: {setting?.show_country ? "Yes" : "No"}</Typography>
          <Typography>Manual scores: {setting?.allow_manual_scores ? "Yes" : "No"}</Typography>
        </Stack>
      </GolfSection>
    </GolfPage>
  );
};
