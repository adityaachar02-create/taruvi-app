import AddRounded from "@mui/icons-material/AddRounded";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useDataGrid, EditButton, ShowButton } from "@refinedev/mui";
import { Link as RouterLink } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import { GolfStatusChip } from "../../components/golf/GolfStatusChip";
import type { GolfTournament } from "../../types/golf";
import { getScoreSourceLabel } from "../../utils/golfDraft";

export const GolfTournamentList = () => {
  const { dataGridProps } = useDataGrid<GolfTournament>({
    resource: "golf_tournaments",
    sorters: { initial: [{ field: "season", order: "desc" }] },
  });

  const columns: GridColDef<GolfTournament>[] = [
    { field: "name", headerName: "Tournament", flex: 1.2, minWidth: 220 },
    {
      field: "season",
      headerName: "Season",
      minWidth: 110,
      renderCell: ({ row }) => String(row.season ?? ""),
    },
    { field: "venue", headerName: "Venue", flex: 1, minWidth: 180 },
    {
      field: "status",
      headerName: "Status",
      minWidth: 140,
      renderCell: ({ row }) => <GolfStatusChip status={row.status} />,
    },
    {
      field: "format",
      headerName: "Format",
      minWidth: 190,
      renderCell: ({ row }) => (
        <Chip size="small" label={`${row.draft_size} managers • ${row.picks_per_manager} picks`} variant="outlined" />
      ),
    },
    {
      field: "score_source",
      headerName: "Scoring",
      minWidth: 170,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={`${getScoreSourceLabel(row.score_source)} • ${row.sync_status}`}
          variant="outlined"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <ShowButton hideText resource="golf_tournaments" recordItemId={row.id} />
          <EditButton hideText resource="golf_tournaments" recordItemId={row.id} />
        </Stack>
      ),
    },
  ];

  return (
    <GolfPage
      eyebrow="Tournaments"
      title="Majors And Pools"
      subtitle="Control the active tournament, schedule, and draft format settings."
      actions={
        <Button component={RouterLink} to="/tournaments/create" variant="contained" startIcon={<AddRounded />}>
          Add Tournament
        </Button>
      }
    >
      <GolfSection title="Tournament List">
        <DataGrid {...dataGridProps} columns={columns} autoHeight disableRowSelectionOnClick />
      </GolfSection>
    </GolfPage>
  );
};
