import AddRounded from "@mui/icons-material/AddRounded";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useDataGrid, EditButton, ShowButton } from "@refinedev/mui";
import { useList } from "@refinedev/core";
import { Link as RouterLink } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import { ScoreToParText } from "../../components/golf/ScoreToParText";
import type { GolfDraftPick, GolfGolfer, GolfScore } from "../../types/golf";
import { getEffectiveScoreToPar } from "../../utils/golfDraft";

export const GolfGolferList = () => {
  const { dataGridProps } = useDataGrid<GolfGolfer>({
    resource: "golf_golfers",
    filters: { permanent: [{ field: "is_active", operator: "eq", value: true }] },
    sorters: { initial: [{ field: "world_rank", order: "asc" }] },
  });
  const picksQuery = useList<GolfDraftPick>({ resource: "golf_draft_picks", pagination: { mode: "off" } });
  const scoresQuery = useList<GolfScore>({ resource: "golf_scores", pagination: { mode: "off" } });

  const draftedIds = new Set((picksQuery.result?.data ?? []).map((pick) => pick.golfer_id as string));
  const scoreMap = new Map((scoresQuery.result?.data ?? []).map((score) => [score.golfer_id as string, score]));

  const columns: GridColDef<GolfGolfer>[] = [
    { field: "full_name", headerName: "Golfer", flex: 1.2, minWidth: 220 },
    { field: "country", headerName: "Country", flex: 0.8, minWidth: 140 },
    { field: "world_rank", headerName: "World Rank", type: "number", minWidth: 120 },
    { field: "seed_tier", headerName: "Tier", minWidth: 90 },
    {
      field: "availability",
      headerName: "Availability",
      minWidth: 140,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={draftedIds.has(row.id) ? "Drafted" : "Available"}
          color={draftedIds.has(row.id) ? "default" : "success"}
          variant="outlined"
        />
      ),
    },
    {
      field: "score",
      headerName: "Score",
      minWidth: 120,
      renderCell: ({ row }) => <ScoreToParText value={getEffectiveScoreToPar(scoreMap.get(row.id))} />,
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <ShowButton hideText resource="golf_golfers" recordItemId={row.id} />
          <EditButton hideText resource="golf_golfers" recordItemId={row.id} />
        </Stack>
      ),
    },
  ];

  return (
    <GolfPage
      eyebrow="Golfers"
      title="Tournament Field"
      subtitle="Track the field, ranking, tier, draft status, and live score snapshot."
      actions={
        <Button component={RouterLink} to="/golfers/create" variant="contained" startIcon={<AddRounded />}>
          Add Golfer
        </Button>
      }
    >
      <GolfSection title="Field Table">
        <DataGrid {...dataGridProps} columns={columns} autoHeight disableRowSelectionOnClick />
      </GolfSection>
    </GolfPage>
  );
};
