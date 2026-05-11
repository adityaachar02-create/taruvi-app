import AutorenewRounded from "@mui/icons-material/AutorenewRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useList } from "@refinedev/core";
import { EditButton, ShowButton } from "@refinedev/mui";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import { ScoreToParText } from "../../components/golf/ScoreToParText";
import { useGolfLiveSync } from "../../hooks/useGolfLiveSync";
import type {
  GolfDraftPick,
  GolfGolfer,
  GolfManager,
  GolfPoolSettings,
  GolfScore,
  GolfTournament,
} from "../../types/golf";
import {
  buildLeaderboard,
  getEffectiveScoreToPar,
  getEntityId,
  getScoreSourceLabel,
  isLiveScoreSource,
} from "../../utils/golfDraft";

export const GolfScoreList = () => {
  const tournamentsQuery = useList<GolfTournament>({ resource: "golf_tournaments", pagination: { mode: "off" } });
  const activeTournament = tournamentsQuery.result?.data?.find((item) => item.is_active);
  const { isSyncing, runManualSync } = useGolfLiveSync(activeTournament ?? null, { enableAutoSync: false });
  const scoresQuery = useList<GolfScore>({
    resource: "golf_scores",
    pagination: { mode: "off" },
    sorters: [{ field: "updated_at", order: "desc" }],
    filters: activeTournament ? [{ field: "tournament_id", operator: "eq", value: activeTournament.id }] : [],
  });
  const golfersQuery = useList<GolfGolfer>({ resource: "golf_golfers", pagination: { mode: "off" } });
  const managersQuery = useList<GolfManager>({
    resource: "golf_managers",
    pagination: { mode: "off" },
    sorters: [{ field: "draft_slot", order: "asc" }],
  });
  const picksQuery = useList<GolfDraftPick>({
    resource: "golf_draft_picks",
    pagination: { mode: "off" },
    filters: activeTournament ? [{ field: "tournament_id", operator: "eq", value: activeTournament.id }] : [],
    sorters: [{ field: "pick_number", order: "asc" }],
  });
  const settingsQuery = useList<GolfPoolSettings>({
    resource: "golf_pool_settings",
    pagination: { mode: "off" },
  });
  const golfersById = new Map((golfersQuery.result?.data ?? []).map((golfer) => [golfer.id, golfer]));
  const picks = picksQuery.result?.data ?? [];
  const draftedGolferIds = new Set(picks.map((pick) => getEntityId(pick.golfer_id)));
  const draftedScores = (scoresQuery.result?.data ?? []).filter((score) =>
    draftedGolferIds.has(getEntityId(score.golfer_id)),
  );
  const leaderboard = buildLeaderboard(
    managersQuery.result?.data ?? [],
    picks,
    scoresQuery.result?.data ?? [],
    settingsQuery.result?.data?.[0]?.leaderboard_tiebreaker ?? "total_to_par",
  );
  const scoreByGolferId = new Map(
    (scoresQuery.result?.data ?? []).map((score) => [getEntityId(score.golfer_id), score]),
  );

  const isLoading =
    tournamentsQuery.query.isLoading ||
    golfersQuery.query.isLoading ||
    managersQuery.query.isLoading ||
    picksQuery.query.isLoading ||
    scoresQuery.query.isLoading ||
    settingsQuery.query.isLoading;

  const columns: GridColDef<GolfScore>[] = [
    {
      field: "golfer_id",
      headerName: "Golfer",
      minWidth: 220,
      flex: 1,
      renderCell: ({ row }) => golfersById.get(row.golfer_id as string)?.full_name || "Unknown golfer",
    },
    { field: "position_label", headerName: "Position", minWidth: 110 },
    {
      field: "to_par",
      headerName: "To Par",
      minWidth: 110,
      renderCell: ({ row }) => <ScoreToParText value={getEffectiveScoreToPar(row)} />,
    },
    { field: "thru", headerName: "Thru", minWidth: 100 },
    { field: "today_score", headerName: "Today", type: "number", minWidth: 100 },
    { field: "strokes", headerName: "Strokes", type: "number", minWidth: 100 },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <ShowButton hideText resource="golf_scores" recordItemId={row.id} />
          <EditButton hideText resource="golf_scores" recordItemId={row.id} />
        </Stack>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <GolfPage
      eyebrow="Scores"
      title="Scoring Console"
      subtitle={
        activeTournament
          ? `${getScoreSourceLabel(activeTournament.score_source)} • ${activeTournament.sync_message || "Only drafted golfers from the active tournament are shown."}`
          : "Edit golfer scores as the major progresses. Only drafted golfers from the active tournament are shown."
      }
      actions={
        activeTournament && isLiveScoreSource(activeTournament.score_source) ? (
          <Button
            variant="contained"
            startIcon={<AutorenewRounded />}
            onClick={runManualSync}
            disabled={isSyncing}
          >
            {isSyncing ? "Syncing..." : "Sync Live Scores"}
          </Button>
        ) : undefined
      }
    >
      <GolfSection
        title="Leaderboard"
        subtitle="Managers are ranked by combined drafted-team score, with each drafted player shown next to the total."
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Manager</TableCell>
              <TableCell>Player 1</TableCell>
              <TableCell>Player 2</TableCell>
              <TableCell align="right">Team Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.map((entry) => {
              const [playerOnePick, playerTwoPick] = entry.picks;
              const playerOneScore = playerOnePick
                ? getEffectiveScoreToPar(scoreByGolferId.get(getEntityId(playerOnePick.golfer_id)))
                : null;
              const playerTwoScore = playerTwoPick
                ? getEffectiveScoreToPar(scoreByGolferId.get(getEntityId(playerTwoPick.golfer_id)))
                : null;

              return (
                <TableRow key={entry.manager.id} hover>
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {entry.manager.display_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Draft slot {entry.manager.draft_slot}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Typography variant="body2">
                        {playerOnePick
                          ? golfersById.get(getEntityId(playerOnePick.golfer_id))?.full_name || "Unknown golfer"
                          : "Open slot"}
                      </Typography>
                      <ScoreToParText value={playerOneScore} variant="caption" />
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Typography variant="body2">
                        {playerTwoPick
                          ? golfersById.get(getEntityId(playerTwoPick.golfer_id))?.full_name || "Unknown golfer"
                          : "Open slot"}
                      </Typography>
                      <ScoreToParText value={playerTwoScore} variant="caption" />
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <ScoreToParText value={entry.totalToPar} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </GolfSection>

      <GolfSection title="Score Rows">
        <DataGrid
          rows={draftedScores}
          columns={columns}
          autoHeight
          disableRowSelectionOnClick
          loading={scoresQuery.query.isLoading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
                page: 0,
              },
            },
          }}
        />
      </GolfSection>
    </GolfPage>
  );
};
