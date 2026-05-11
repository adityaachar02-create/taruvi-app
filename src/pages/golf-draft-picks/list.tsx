import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import DragIndicatorRounded from "@mui/icons-material/DragIndicatorRounded";
import DoneAllRounded from "@mui/icons-material/DoneAllRounded";
import RestartAltRounded from "@mui/icons-material/RestartAltRounded";
import SaveRounded from "@mui/icons-material/SaveRounded";
import SportsRounded from "@mui/icons-material/SportsRounded";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
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
import { useCreate, useDelete, useInvalidate, useList, useNotification, useUpdate } from "@refinedev/core";
import { ShowButton } from "@refinedev/mui";
import { useEffect, useMemo, useState } from "react";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import { GolfStatusChip } from "../../components/golf/GolfStatusChip";
import { useActiveTournament } from "../../hooks/useActiveTournament";
import { useResetTournamentData } from "../../hooks/useResetTournamentData";
import type { GolfDraftPick, GolfGolfer, GolfManager, GolfScore, TournamentStatus } from "../../types/golf";
import {
  buildSnakeDraftSlots,
  getAvailableGolfers,
  getDraftCompletion,
  getEntityId,
  getNextDraftSlot,
  normalizeManagers,
} from "../../utils/golfDraft";

const STATUS_OPTIONS: TournamentStatus[] = ["setup", "draft_live", "in_progress", "final"];

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

interface DraftManagerItemProps {
  manager: GolfManager;
  onNameChange: (managerId: string, nextName: string) => void;
}

const SortableDraftManagerItem = ({ manager, onNameChange }: DraftManagerItemProps) => {
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
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
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
              flexShrink: 0,
            }}
          >
            {manager.draft_slot}
          </Box>
          <TextField
            size="small"
            value={manager.display_name}
            onChange={(event) => onNameChange(manager.id, event.target.value)}
            placeholder="Manager name"
            sx={{ flex: 1 }}
          />
        </Stack>
        <IconButton size="small" {...attributes} {...listeners} aria-label={`Drag ${manager.display_name}`}>
          <DragIndicatorRounded fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
};

export const GolfDraftPickList = () => {
  const [searchValue, setSearchValue] = useState("");
  const [orderedManagers, setOrderedManagers] = useState<GolfManager[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSavingManagers, setIsSavingManagers] = useState(false);
  const { activeTournament, query: tournamentQuery } = useActiveTournament();
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
  });
  const { mutate: createPick, mutation: createPickMutation } = useCreate();
  const { mutate: deletePick, mutation: deletePickMutation } = useDelete();
  const { mutate: updateTournament, mutation: updateTournamentMutation } = useUpdate();
  const { mutate: updateManager } = useUpdate();
  const invalidate = useInvalidate();
  const { open } = useNotification();
  const { resetTournamentData, isResetting } = useResetTournamentData();

  const managers = useMemo(() => normalizeManagers(managersQuery.result?.data ?? []), [managersQuery.result?.data]);
  const draftManagers = orderedManagers.length ? orderedManagers : managers;
  const golfers = golfersQuery.result?.data ?? [];
  const picks = picksQuery.result?.data ?? [];
  const scores = scoresQuery.result?.data ?? [];
  const golferMap = new Map(golfers.map((golfer) => [golfer.id, golfer]));
  const picksByNumber = new Map(picks.map((pick) => [pick.pick_number, pick]));
  const nextSlot = activeTournament
    ? getNextDraftSlot(managers, activeTournament.picks_per_manager, picks.length)
    : null;
  const draftSlots = activeTournament ? buildSnakeDraftSlots(managers, activeTournament.picks_per_manager) : [];
  const availableGolfers = getAvailableGolfers(golfers, picks);
  const lastPick = picks[picks.length - 1] ?? null;
  const filteredGolfers = useMemo(() => {
    const search = searchValue.trim().toLowerCase();
    if (!search) {
      return availableGolfers;
    }

    return availableGolfers.filter((golfer) => golfer.full_name.toLowerCase().includes(search));
  }, [availableGolfers, searchValue]);
  const draftCompletion = activeTournament
    ? getDraftCompletion(managers, activeTournament.picks_per_manager, picks)
    : { totalSlots: 0, picksMade: 0, picksRemaining: 0, completionRate: 0 };

  const isLoading =
    tournamentQuery.isLoading ||
    managersQuery.query.isLoading ||
    golfersQuery.query.isLoading ||
    picksQuery.query.isLoading ||
    scoresQuery.query.isLoading;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    setOrderedManagers(managers);
  }, [managers]);

  const refetchAll = async () => {
    await Promise.all([
      picksQuery.query.refetch(),
      managersQuery.query.refetch(),
      golfersQuery.query.refetch(),
      scoresQuery.query.refetch(),
      tournamentQuery.refetch(),
    ]);
  };

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

  const handleManagerDragEnd = (event: DragEndEvent) => {
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

  const handleManagerNameChange = (managerId: string, nextName: string) => {
    setOrderedManagers((currentManagers) =>
      currentManagers.map((manager) =>
        manager.id === managerId ? { ...manager, display_name: nextName } : manager,
      ),
    );
  };

  const handleUndoLastPick = () => {
    if (!lastPick) {
      return;
    }

    const undoneManager = managers.find((manager) => manager.id === getEntityId(lastPick.manager_id));
    const undoneGolfer = golfers.find((golfer) => golfer.id === getEntityId(lastPick.golfer_id));

    deletePick(
      {
        resource: "golf_draft_picks",
        id: lastPick.id,
      },
      {
        onSuccess: async () => {
          open?.({
            type: "success",
            message: "Previous pick removed",
            description: undoneManager && undoneGolfer
              ? `${undoneGolfer.full_name} was removed from ${undoneManager.display_name}'s roster.`
              : "The last draft pick was rolled back.",
          });
          await refetchAll();
        },
        onError: (error) => {
          open?.({
            type: "error",
            message: "Could not undo pick",
            description: error.message,
          });
        },
      },
    );
  };

  const handleManagerReset = () => {
    setOrderedManagers(managers);
    setSaveError(null);
  };

  const hasManagerChanges = useMemo(() => {
    if (managers.length !== draftManagers.length) {
      return false;
    }

    return managers.some((manager, index) => {
      const nextManager = draftManagers[index];
      if (!nextManager) {
        return true;
      }

      return (
        manager.id !== nextManager.id ||
        manager.display_name !== nextManager.display_name.trim() ||
        manager.draft_slot !== index + 1
      );
    });
  }, [draftManagers, managers]);

  const handleSaveManagers = async () => {
    setIsSavingManagers(true);
    setSaveError(null);

    try {
      const normalizedManagers = draftManagers.map((manager, index) => ({
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
      await refetchAll();
      open?.({
        type: "success",
        message: "Managers updated",
        description: "Draft order and manager names are now saved to the draft room.",
      });
    } catch (error) {
      const description = error instanceof Error ? error.message : "Could not save manager changes.";
      setSaveError(description);
      open?.({
        type: "error",
        message: "Manager save failed",
        description,
      });
    } finally {
      setIsSavingManagers(false);
    }
  };

  const handleDraftGolfer = (golfer: GolfGolfer) => {
    if (!activeTournament || !nextSlot) {
      return;
    }

    createPick(
      {
        resource: "golf_draft_picks",
        values: {
          id: crypto.randomUUID(),
          tournament_id: activeTournament.id,
          manager_id: nextSlot.manager.id,
          golfer_id: golfer.id,
          pick_number: nextSlot.pickNumber,
          round_number: nextSlot.roundNumber,
          slot_in_round: nextSlot.slotInRound,
          draft_direction: nextSlot.draftDirection,
          picked_at: new Date().toISOString(),
        },
      },
      {
        onSuccess: async () => {
          open?.({
            type: "success",
            message: "Pick recorded",
            description: `${nextSlot.manager.display_name} drafted ${golfer.full_name}.`,
          });
          await refetchAll();
        },
        onError: (error) => {
          open?.({
            type: "error",
            message: "Pick failed",
            description: error.message,
          });
        },
      },
    );
  };

  const handleStatusChange = (status: TournamentStatus) => {
    if (!activeTournament || activeTournament.status === status) {
      return;
    }

    const shouldResetTournament = activeTournament.status !== "final" && status === "final";

    updateTournament(
      {
        resource: "golf_tournaments",
        id: activeTournament.id,
        values: { status },
      },
      {
        onSuccess: async () => {
          try {
            if (shouldResetTournament) {
              await resetTournamentData(activeTournament.id);
            }

            open?.({
              type: "success",
              message: "Tournament updated",
              description: shouldResetTournament
                ? "Status changed to final and the leaderboard/player pool were reset."
                : `Status changed to ${status.replaceAll("_", " ")}.`,
            });
            await refetchAll();
          } catch (error) {
            open?.({
              type: "error",
              message: "Tournament updated, but reset failed",
              description: error instanceof Error ? error.message : "The leaderboard and player pool could not be reset.",
            });
            await tournamentQuery.refetch();
          }
        },
      },
    );
  };

  if (isLoading) {
    return (
      <Stack sx={{ minHeight: "60vh" }} alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <GolfPage
      eyebrow="Draft Board"
      title={activeTournament?.name || "No active tournament"}
      subtitle="Edit managers, set the snake order, and run the draft from one room."
      actions={
        <>
          <Button variant="outlined" component="a" href="#available-golfers">
            Jump To Available Golfers
          </Button>
          <Button variant="contained" href="#draft-order">
            View Draft Order
          </Button>
        </>
      }
    >
      <GolfSection
        title="Current State"
        subtitle="Only the next snake slot can draft. Status buttons help the commissioner move from setup to live scoring."
        action={activeTournament ? <GolfStatusChip status={activeTournament.status} /> : null}
      >
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} flexWrap="wrap" useFlexGap>
            {STATUS_OPTIONS.map((status) => (
              <Button
                key={status}
                variant={activeTournament?.status === status ? "contained" : "outlined"}
                onClick={() => handleStatusChange(status)}
                disabled={updateTournamentMutation.isPending || isResetting}
              >
                {toTitleCase(status.replaceAll("_", " "))}
              </Button>
            ))}
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} flexWrap="wrap" useFlexGap alignItems={{ md: "center" }}>
            <Chip icon={<SportsRounded />} label={`${draftCompletion.picksMade}/${draftCompletion.totalSlots} Picks Made`} />
            <Chip icon={<AccessTimeRounded />} label={nextSlot ? `${nextSlot.manager.display_name} Is On The Clock` : "Draft Complete"} />
            <Chip icon={<DoneAllRounded />} label={`${draftCompletion.picksRemaining} Picks Remaining`} variant="outlined" />
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleUndoLastPick}
              disabled={!lastPick || deletePickMutation.isPending}
            >
              Undo Previous Pick
            </Button>
          </Stack>
        </Stack>
      </GolfSection>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", xl: "1.15fr 0.85fr" },
        }}
      >
        <GolfSection
          title="Managers And Draft Order"
          subtitle="Edit names, drag the saved order, and lock in the snake before making picks."
          action={
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<RestartAltRounded />}
                onClick={handleManagerReset}
                disabled={!hasManagerChanges || isSavingManagers}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveRounded />}
                onClick={handleSaveManagers}
                disabled={!hasManagerChanges || isSavingManagers}
              >
                Save Managers
              </Button>
            </Stack>
          }
        >
          <Stack spacing={2}>
            {saveError ? <Alert severity="error">{saveError}</Alert> : null}
            <Alert severity="info">
              Save manager edits before drafting. The saved order becomes round one of the snake draft, and round two reverses automatically.
            </Alert>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleManagerDragEnd}>
              <SortableContext items={draftManagers.map((manager) => manager.id)} strategy={verticalListSortingStrategy}>
                <Stack spacing={1.25}>
                  {draftManagers.map((manager) => (
                    <SortableDraftManagerItem
                      key={manager.id}
                      manager={manager}
                      onNameChange={handleManagerNameChange}
                    />
                  ))}
                </Stack>
              </SortableContext>
            </DndContext>
            <Divider />
            <Table id="draft-order" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Pick</TableCell>
                  <TableCell>Manager</TableCell>
                  <TableCell>Golfer</TableCell>
                  <TableCell>Round</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {draftSlots.map((slot) => {
                  const existingPick = picksByNumber.get(slot.pickNumber);
                  const golfer = existingPick ? golferMap.get(getEntityId(existingPick.golfer_id)) : null;

                  return (
                    <TableRow key={slot.pickNumber} selected={slot.pickNumber === nextSlot?.pickNumber}>
                      <TableCell>#{slot.pickNumber}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {slot.manager.display_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Slot {slot.manager.draft_slot} • {slot.draftDirection}
                        </Typography>
                      </TableCell>
                      <TableCell>{golfer?.full_name || "Awaiting pick"}</TableCell>
                      <TableCell>{slot.roundNumber}</TableCell>
                      <TableCell>
                        {existingPick ? (
                          <Stack direction="row" spacing={1}>
                            <ShowButton hideText resource="golf_draft_picks" recordItemId={existingPick.id} />
                          </Stack>
                        ) : slot.pickNumber === nextSlot?.pickNumber ? (
                          <Chip size="small" color="warning" label="On the clock" />
                        ) : (
                          <Chip size="small" variant="outlined" label="Pending" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Stack>
        </GolfSection>

        <GolfSection
          title="Available Golfers"
          subtitle="Search the field and assign the next golfer in line."
          action={
            <TextField
              id="available-golfers"
              size="small"
              placeholder="Search golfer"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          }
        >
          <Stack spacing={1.5}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                gap: 1.5,
              }}
            >
              {filteredGolfers.slice(0, 18).map((golfer) => (
                <Paper
                  key={golfer.id}
                  elevation={0}
                  sx={{
                    borderRadius: 1,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    p: 2,
                    height: "100%",
                  }}
                >
                  <Stack spacing={1.5} justifyContent="space-between" sx={{ height: "100%" }}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {golfer.full_name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {golfer.country || "Country TBD"} • world rank #{golfer.world_rank ?? "—"} • tier {golfer.seed_tier || "Unassigned"}
                      </Typography>
                    </Stack>
                    <Button
                      variant="contained"
                      onClick={() => handleDraftGolfer(golfer)}
                      disabled={!nextSlot || createPickMutation.isPending}
                    >
                      {nextSlot ? `Draft To ${nextSlot.manager.display_name}` : "Draft complete"}
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Box>
            {!filteredGolfers.length ? (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No golfers match the current search.
              </Typography>
            ) : null}
          </Stack>
        </GolfSection>
      </Box>

      <GolfSection
        title="Manager Rosters"
        subtitle="Each manager card reflects the golfers already assigned to that roster."
      >
        <Stack spacing={2}>
          {managers.map((manager) => {
            const managerPicks = picks.filter((pick) => getEntityId(pick.manager_id) === manager.id);

            return (
              <Paper
                key={manager.id}
                elevation={0}
                sx={{
                  borderRadius: 1,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  p: 2,
                }}
              >
                <Stack spacing={1.25}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {manager.display_name}
                    </Typography>
                    <Chip size="small" label={`Slot ${manager.draft_slot}`} />
                  </Stack>
                  <Divider />
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {managerPicks.length ? (
                      managerPicks.map((pick) => {
                        const golfer = golferMap.get(getEntityId(pick.golfer_id));
                        return <Chip key={pick.id} label={golfer?.full_name || "Unknown golfer"} variant="outlined" />;
                      })
                    ) : (
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        No picks yet.
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </GolfSection>
    </GolfPage>
  );
};
