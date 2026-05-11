import AddRounded from "@mui/icons-material/AddRounded";
import DragIndicatorRounded from "@mui/icons-material/DragIndicatorRounded";
import RestartAltRounded from "@mui/icons-material/RestartAltRounded";
import SaveRounded from "@mui/icons-material/SaveRounded";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useInvalidate, useList, useNotification, useUpdate } from "@refinedev/core";
import { EditButton, ShowButton } from "@refinedev/mui";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import { ScoreToParText } from "../../components/golf/ScoreToParText";
import type { GolfDraftPick, GolfGolfer, GolfManager, GolfPoolSettings, GolfScore } from "../../types/golf";
import { buildLeaderboard, getEntityId } from "../../utils/golfDraft";

interface DraftOrderItemProps {
  manager: GolfManager;
  onNameChange: (managerId: string, nextName: string) => void;
}

const SortableDraftOrderItem = ({ manager, onNameChange }: DraftOrderItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: manager.id,
  });

  return (
    <Paper
      ref={setNodeRef}
      elevation={0}
      sx={{
        borderRadius: 1,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        px: 2,
        py: 1.5,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.72 : 1,
        backgroundColor: isDragging ? "action.hover" : "background.paper",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              backgroundColor: "action.hover",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {manager.draft_slot}
          </Box>
          <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
            <TextField
              size="small"
              value={manager.display_name}
              onChange={(event) => onNameChange(manager.id, event.target.value)}
              placeholder="Manager name"
              sx={{ minWidth: { xs: 160, sm: 220 } }}
            />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {manager.is_commissioner ? "Commissioner" : "Manager"}
            </Typography>
          </Stack>
        </Stack>
        <IconButton size="small" {...attributes} {...listeners} aria-label={`Drag ${manager.display_name}`}>
          <DragIndicatorRounded fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
};

export const GolfManagerList = () => {
  const managersQuery = useList<GolfManager>({
    resource: "golf_managers",
    pagination: { mode: "off" },
    sorters: [{ field: "draft_slot", order: "asc" }],
  });
  const golfersQuery = useList<GolfGolfer>({
    resource: "golf_golfers",
    pagination: { mode: "off" },
  });
  const picksQuery = useList<GolfDraftPick>({
    resource: "golf_draft_picks",
    pagination: { mode: "off" },
    sorters: [{ field: "pick_number", order: "asc" }],
  });
  const scoresQuery = useList<GolfScore>({
    resource: "golf_scores",
    pagination: { mode: "off" },
  });
  const settingsQuery = useList<GolfPoolSettings>({
    resource: "golf_pool_settings",
    pagination: { mode: "off" },
  });
  const { mutate: updateManager } = useUpdate();
  const invalidate = useInvalidate();
  const { open } = useNotification();
  const [orderedManagers, setOrderedManagers] = useState<GolfManager[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const managers = managersQuery.result?.data ?? [];
    setOrderedManagers(managers);
  }, [managersQuery.result?.data]);

  const buildTemporaryManagerName = (manager: Pick<GolfManager, "id">, index: number) =>
    `__tmp_manager_${index}_${String(manager.id).replaceAll("-", "_")}`;

  const persistManager = (manager: GolfManager, draftSlot: number, displayName = manager.display_name) =>
    new Promise<void>((resolve, reject) => {
      updateManager(
        {
          resource: "golf_managers",
          id: manager.id,
          values: {
            display_name: displayName,
            draft_slot: draftSlot,
            color_hex: manager.color_hex || null,
            is_commissioner: manager.is_commissioner,
          },
        },
        {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        },
      );
    });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setOrderedManagers((currentManagers) => {
      const oldIndex = currentManagers.findIndex((manager) => manager.id === active.id);
      const newIndex = currentManagers.findIndex((manager) => manager.id === over.id);
      const reordered = arrayMove(currentManagers, oldIndex, newIndex);

      return reordered.map((manager, index) => ({
        ...manager,
        draft_slot: index + 1,
      }));
    });
  };

  const handleResetOrder = () => {
    setOrderedManagers(managersQuery.result?.data ?? []);
    setSaveError(null);
  };

  const handleNameChange = (managerId: string, nextName: string) => {
    setOrderedManagers((currentManagers) =>
      currentManagers.map((manager) =>
        manager.id === managerId ? { ...manager, display_name: nextName } : manager,
      ),
    );
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    setSaveError(null);

    try {
      const normalizedManagers = orderedManagers.map((manager, index) => ({
        ...manager,
        display_name: manager.display_name.trim(),
        draft_slot: index + 1,
      }));

      if (normalizedManagers.some((manager) => !manager.display_name)) {
        throw new Error("Every manager needs a name before you can save.");
      }

      const seenNames = new Set<string>();
      for (const manager of normalizedManagers) {
        const key = manager.display_name.toLowerCase();
        if (seenNames.has(key)) {
          throw new Error(`Manager name "${manager.display_name}" is duplicated. Use unique names before saving.`);
        }
        seenNames.add(key);
      }

      // First move everyone to temporary names and draft slots so both unique constraints
      // can survive swaps and multi-manager edits during the same save.
      for (const [index, manager] of normalizedManagers.entries()) {
        await persistManager(manager, 1000 + index, buildTemporaryManagerName(manager, index));
      }
      for (const [index, manager] of normalizedManagers.entries()) {
        await persistManager(manager, index + 1, manager.display_name);
      }
      setOrderedManagers(normalizedManagers);
      await invalidate({
        resource: "golf_managers",
        invalidates: ["resourceAll"],
      });
      await managersQuery.query.refetch();
      open?.({
        type: "success",
        message: "Draft order updated",
        description: "The new drag-and-drop order and manager names are now saved.",
      });
    } catch (error) {
      const description = error instanceof Error ? error.message : "Could not save the new draft order.";
      setSaveError(description);
      open?.({
        type: "error",
        message: "Draft order update failed",
        description,
      });
    } finally {
      setIsSavingOrder(false);
    }
  };

  const hasDraftOrderChanges = useMemo(() => {
    const current = managersQuery.result?.data ?? [];
    if (current.length !== orderedManagers.length) {
      return false;
    }

    return current.some((manager, index) => {
      const nextManager = orderedManagers[index];
      if (!nextManager) {
        return true;
      }

      return (
        manager.id !== nextManager.id ||
        manager.display_name !== nextManager.display_name.trim() ||
        manager.draft_slot !== index + 1
      );
    });
  }, [managersQuery.result?.data, orderedManagers]);

  if (
    managersQuery.query.isLoading ||
    golfersQuery.query.isLoading ||
    picksQuery.query.isLoading ||
    scoresQuery.query.isLoading ||
    settingsQuery.query.isLoading
  ) {
    return (
      <Stack sx={{ minHeight: "60vh" }} alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  const managers = managersQuery.result?.data ?? [];
  const golfers = golfersQuery.result?.data ?? [];
  const picks = picksQuery.result?.data ?? [];
  const scores = scoresQuery.result?.data ?? [];
  const settings = settingsQuery.result?.data?.[0] ?? null;
  const golferMap = new Map(golfers.map((golfer) => [golfer.id, golfer]));
  const leaderboardManagers = orderedManagers.length ? orderedManagers : managers;
  const managerMap = new Map(leaderboardManagers.map((manager) => [manager.id, manager]));
  const leaderboard = buildLeaderboard(
    leaderboardManagers,
    picks,
    scores,
    settings?.leaderboard_tiebreaker ?? "total_to_par",
  );

  return (
    <GolfPage
      eyebrow="Managers"
      title="Rosters"
      subtitle="Every manager, their draft position, and the golfers currently assigned to their team."
      actions={
        <Button component={RouterLink} to="/managers/create" variant="contained" startIcon={<AddRounded />}>
          Add Manager
        </Button>
      }
    >
      <GolfSection
        title="Pool Managers"
        subtitle="Drag to set draft order, edit names inline, and review each roster in one place."
        action={
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<RestartAltRounded />}
              onClick={handleResetOrder}
              disabled={!hasDraftOrderChanges || isSavingOrder}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveRounded />}
              onClick={handleSaveOrder}
              disabled={!hasDraftOrderChanges || isSavingOrder}
            >
              Save Order
            </Button>
          </Stack>
        }
      >
        <Stack spacing={2}>
          {saveError ? <Alert severity="error">{saveError}</Alert> : null}
          <Alert severity="info">
            The list below is the live snake draft order. Once saved, round one follows top-to-bottom and round two reverses automatically.
          </Alert>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedManagers.map((manager) => manager.id)} strategy={verticalListSortingStrategy}>
              <Stack spacing={1.25}>
                {orderedManagers.map((manager) => (
                  <SortableDraftOrderItem
                    key={manager.id}
                    manager={manager}
                    onNameChange={handleNameChange}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
          <Divider />
          {leaderboard.map((entry) => (
            <Paper
              key={entry.manager.id}
              elevation={0}
              sx={{
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                p: 2.5,
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={1.5}
                >
                  <Stack spacing={0.5}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {managerMap.get(entry.manager.id)?.display_name || entry.manager.display_name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Draft slot {managerMap.get(entry.manager.id)?.draft_slot || entry.manager.draft_slot} • {entry.manager.is_commissioner ? "Commissioner" : "Manager"}
                      </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Stack direction="row" spacing={0.5} alignItems="baseline">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Team total:
                      </Typography>
                      <ScoreToParText value={entry.totalToPar} variant="body2" sx={{ fontWeight: 600 }} />
                    </Stack>
                    <ShowButton hideText resource="golf_managers" recordItemId={entry.manager.id} />
                    <EditButton hideText resource="golf_managers" recordItemId={entry.manager.id} />
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {entry.picks.length ? (
                    entry.picks.map((pick) => (
                      <Paper
                        key={pick.id}
                        elevation={0}
                        sx={{
                          px: 1.5,
                          py: 1,
                          borderRadius: 999,
                          border: (theme) => `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="body2">
                          {golferMap.get(getEntityId(pick.golfer_id))?.full_name || "Unknown golfer"}
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      No golfers drafted yet.
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </GolfSection>
    </GolfPage>
  );
};
