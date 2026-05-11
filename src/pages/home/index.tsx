import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import SportsGolfRounded from "@mui/icons-material/SportsGolfRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useList } from "@refinedev/core";
import { useMemo } from "react";
import { Link as RouterLink } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import { ScoreToParText } from "../../components/golf/ScoreToParText";
import { GolfStatusChip } from "../../components/golf/GolfStatusChip";
import { useActiveTournament } from "../../hooks/useActiveTournament";
import type {
  GolfDraftPick,
  GolfGolfer,
  GolfManager,
  GolfPoolSettings,
  GolfScore,
} from "../../types/golf";
import {
  buildLeaderboard,
  countEnteredScores,
  getAvailableGolfers,
  getDraftCompletion,
  getNextDraftSlot,
  normalizeManagers,
  getPoolName,
  getTiebreakerLabel,
  getTournamentStatusDescription,
} from "../../utils/golfDraft";

const MetricPanel = ({ label, value, detail }: { label: string; value: string; detail: string }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 1,
      border: (theme) => `1px solid ${theme.palette.divider}`,
      p: 3,
      minHeight: 160,
      background: (theme) =>
        theme.palette.mode === "dark"
          ? "linear-gradient(160deg, rgba(19, 35, 26, 0.98), rgba(54, 82, 44, 0.42))"
          : "linear-gradient(160deg, rgba(255, 252, 243, 0.98), rgba(210, 228, 189, 0.68))",
      boxShadow: (theme) =>
        theme.palette.mode === "dark"
          ? "0 18px 32px rgba(0, 0, 0, 0.18)"
          : "0 20px 42px rgba(50, 83, 42, 0.08)",
    }}
  >
    <Typography variant="overline" sx={{ color: "primary.main", letterSpacing: "0.16em" }}>
      {label}
    </Typography>
    <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>
      {value}
    </Typography>
    <Typography variant="body2" sx={{ mt: 1.5, color: "text.secondary" }}>
      {detail}
    </Typography>
  </Paper>
);

export const Home = () => {
  const { activeTournament, query: tournamentQuery } = useActiveTournament();
  const settingsQuery = useList<GolfPoolSettings>({
    resource: "golf_pool_settings",
    pagination: { mode: "off" },
  });
  const managersQuery = useList<GolfManager>({
    resource: "golf_managers",
    pagination: { mode: "off" },
    sorters: [{ field: "draft_slot", order: "asc" }],
  });
  const golfersQuery = useList<GolfGolfer>({
    resource: "golf_golfers",
    pagination: { mode: "off" },
    filters: [{ field: "is_active", operator: "eq", value: true }],
    sorters: [{ field: "world_rank", order: "asc" }],
  });
  const picksQuery = useList<GolfDraftPick>({
    resource: "golf_draft_picks",
    pagination: { mode: "off" },
    filters: activeTournament ? [{ field: "tournament_id", operator: "eq", value: activeTournament.id }] : [],
    sorters: [{ field: "pick_number", order: "asc" }],
  });
  const scoresQuery = useList<GolfScore>({
    resource: "golf_scores",
    pagination: { mode: "off" },
    filters: activeTournament ? [{ field: "tournament_id", operator: "eq", value: activeTournament.id }] : [],
    sorters: [{ field: "updated_at", order: "desc" }],
  });

  const poolSettings = settingsQuery.result?.data?.[0] ?? null;
  const managers = useMemo(() => normalizeManagers(managersQuery.result?.data ?? []), [managersQuery.result?.data]);
  const golfers = golfersQuery.result?.data ?? [];
  const picks = picksQuery.result?.data ?? [];
  const scores = scoresQuery.result?.data ?? [];
  const leaderboard = buildLeaderboard(
    managers,
    picks,
    scores,
    poolSettings?.leaderboard_tiebreaker ?? "total_to_par",
  );
  const availableGolfers = getAvailableGolfers(golfers, picks);
  const draftCompletion = activeTournament
    ? getDraftCompletion(managers, activeTournament.picks_per_manager, picks)
    : { totalSlots: 0, picksMade: 0, picksRemaining: 0, completionRate: 0 };
  const nextDraftSlot = activeTournament
    ? getNextDraftSlot(managers, activeTournament.picks_per_manager, picks.length)
    : null;
  const scoresEntered = countEnteredScores(scores);

  const isLoading =
    tournamentQuery.isLoading ||
    settingsQuery.query.isLoading ||
    managersQuery.query.isLoading ||
    golfersQuery.query.isLoading ||
    picksQuery.query.isLoading ||
    scoresQuery.query.isLoading;

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <GolfPage
      eyebrow="Clubhouse Dashboard"
      title={getPoolName(poolSettings)}
      subtitle={
        poolSettings?.tagline ||
        "Track your pool like a tournament host: a greener, scorecard-inspired dashboard for draft night, leaderboard shifts, and live scoring."
      }
      actions={
        <>
          <Button component={RouterLink} to="/draft" variant="contained" endIcon={<ArrowForwardRounded />}>
            Open Draft Board
          </Button>
          <Button component={RouterLink} to="/scores" variant="outlined" startIcon={<EditRounded />}>
            Update Scores
          </Button>
          <Button component={RouterLink} to="/settings" variant="text" startIcon={<SettingsRounded />}>
            Pool Settings
          </Button>
        </>
      }
    >
      <GolfSection
        title={activeTournament?.name || "No active tournament"}
        subtitle={
          activeTournament
            ? `${activeTournament.venue || "Venue TBD"} • ${activeTournament.season} season`
            : "Create or activate a tournament to start the pool."
        }
        action={activeTournament ? <GolfStatusChip status={activeTournament.status} /> : null}
      >
        <Stack spacing={2}>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            {activeTournament ? getTournamentStatusDescription(activeTournament.status) : "Use the tournaments resource to create the next major week."}
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} flexWrap="wrap" useFlexGap>
            <Chip label={`${managers.length} managers`} variant="outlined" />
            <Chip label={`${golfers.length} golfers in field`} variant="outlined" />
            <Chip label={`${draftCompletion.totalSlots} total draft slots`} variant="outlined" />
            <Chip label={`${scoresEntered} score rows entered`} variant="outlined" />
            <Chip
              label={`Tiebreaker: ${getTiebreakerLabel(poolSettings?.leaderboard_tiebreaker ?? "total_to_par")}`}
              variant="outlined"
            />
          </Stack>
        </Stack>
      </GolfSection>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        <MetricPanel
          label="Draft Progress"
          value={`${draftCompletion.picksMade}/${draftCompletion.totalSlots || 0}`}
          detail={`${draftCompletion.completionRate}% complete with ${draftCompletion.picksRemaining} selections remaining.`}
        />
        <MetricPanel
          label="On The Tee"
          value={nextDraftSlot ? `#${nextDraftSlot.pickNumber}` : "Done"}
          detail={
            nextDraftSlot
              ? `${nextDraftSlot.manager.display_name} is on the clock in round ${nextDraftSlot.roundNumber}.`
              : "Every roster spot is filled."
          }
        />
        <MetricPanel
          label="Still In The Field"
          value={`${availableGolfers.length}`}
          detail="Undrafted golfers are sorted by world rank so the commissioner can move quickly."
        />
        <MetricPanel
          label="Scorecards Posted"
          value={`${scoresEntered}/${scores.length}`}
          detail="Each score record can be edited from the scoring resource as the tournament unfolds."
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", xl: "1.4fr 1fr" },
        }}
      >
        <GolfSection
          title="Leaderboard"
          subtitle="Managers are ranked by combined team score to par, with the configured tiebreaker applied on equal totals."
          action={<Button component={RouterLink} to="/draft" variant="text">Open Draft Room</Button>}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Manager</TableCell>
                <TableCell align="right">Roster</TableCell>
                <TableCell align="right">Scored</TableCell>
                <TableCell align="right">Team Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboard.map((entry) => (
                <TableRow key={entry.manager.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: entry.manager.color_hex || "primary.main",
                        }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {entry.manager.display_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Tee slot {entry.manager.draft_slot}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">{entry.rosterSize}</TableCell>
                  <TableCell align="right">{entry.scoredGolfers}</TableCell>
                  <TableCell align="right">
                    <ScoreToParText value={entry.totalToPar} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </GolfSection>

        <Stack spacing={3}>
          <GolfSection
            title="On The Clock"
            subtitle="The draft board enforces the next snake slot and only assigns one golfer at a time."
            action={<Button component={RouterLink} to="/draft" variant="outlined">Go To Draft</Button>}
          >
            {nextDraftSlot ? (
              <Stack spacing={1.5}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {nextDraftSlot.manager.display_name}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Pick #{nextDraftSlot.pickNumber} • round {nextDraftSlot.roundNumber} • slot {nextDraftSlot.slotInRound}
                </Typography>
                <Divider />
                <Typography variant="body2">
                  {availableGolfers[0]?.full_name
                    ? `Highest-ranked available golfer: ${availableGolfers[0].full_name}.`
                    : "No golfers remain in the field."}
                </Typography>
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                The draft is complete. Move the tournament to in-progress once score updates begin.
              </Typography>
            )}
          </GolfSection>

          <GolfSection
            title="Top Available Golfers"
            subtitle="A quick glance at the highest-ranked undrafted options still on the board."
            action={<Button component={RouterLink} to="/golfers" variant="text" startIcon={<SportsGolfRounded />}>View Field</Button>}
          >
            <Stack spacing={1.25}>
              {availableGolfers.slice(0, 6).map((golfer) => (
                <Stack key={golfer.id} direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {golfer.full_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {golfer.country || "Country TBD"} • tier {golfer.seed_tier || "Unassigned"}
                    </Typography>
                  </Box>
                  <Chip label={`#${golfer.world_rank ?? "—"}`} size="small" />
                </Stack>
              ))}
            </Stack>
          </GolfSection>
        </Stack>
      </Box>
    </GolfPage>
  );
};
