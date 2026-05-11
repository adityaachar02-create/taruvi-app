import SettingsRounded from "@mui/icons-material/SettingsRounded";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useList } from "@refinedev/core";
import { Link as RouterLink } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import type { GolfPoolSettings, GolfTournament } from "../../types/golf";
import { getTiebreakerLabel } from "../../utils/golfDraft";

export const GolfPoolSettingsList = () => {
  const settingsQuery = useList<GolfPoolSettings>({ resource: "golf_pool_settings", pagination: { mode: "off" } });
  const tournamentsQuery = useList<GolfTournament>({ resource: "golf_tournaments", pagination: { mode: "off" } });

  if (settingsQuery.query.isLoading || tournamentsQuery.query.isLoading) {
    return (
      <Stack sx={{ minHeight: "60vh" }} alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  const setting = settingsQuery.result?.data?.[0] ?? null;
  const tournament = tournamentsQuery.result?.data?.find((item) => item.id === setting?.default_tournament_id);

  return (
    <GolfPage
      eyebrow="Settings"
      title="Pool Settings"
      subtitle="These values control the public name, draft board defaults, and leaderboard behavior."
      actions={
        setting ? (
          <Button component={RouterLink} to={`/settings/edit/${setting.id}`} variant="contained" startIcon={<SettingsRounded />}>
            Edit Settings
          </Button>
        ) : null
      }
    >
      <GolfSection title={setting?.pool_name || "No settings row found"}>
        {setting ? (
          <Stack spacing={1}>
            <Typography>{setting.tagline || "No tagline configured."}</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Commissioner: {setting.commissioner_name || "Not set"}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Default tournament: {tournament?.name || "Not linked"}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Tiebreaker: {getTiebreakerLabel(setting.leaderboard_tiebreaker)}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Draft clock: {setting.draft_clock_enabled ? `${setting.draft_clock_seconds ?? 0} seconds` : "Disabled"}
            </Typography>
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Seed a settings row to configure the pool.
          </Typography>
        )}
      </GolfSection>
    </GolfPage>
  );
};
