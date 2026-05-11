import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { useEffect } from "react";
import { useNotification, useOne, useUpdate } from "@refinedev/core";
import { SaveButton } from "@refinedev/mui";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import { useResetTournamentData } from "../../hooks/useResetTournamentData";
import type { GolfTournament, ScoreSource, TournamentStatus } from "../../types/golf";

interface TournamentFormValues {
  name: string;
  season: number;
  venue: string;
  status: TournamentStatus;
  score_source: ScoreSource;
  external_tournament_key: string;
  auto_refresh_seconds: number | null;
  starts_on: string;
  ends_on: string;
  draft_size: number;
  picks_per_manager: number;
  is_active: boolean;
}

export const GolfTournamentEdit = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { open } = useNotification();
  const { result: tournament, query } = useOne<GolfTournament>({ resource: "golf_tournaments", id });
  const { mutate, mutation } = useUpdate();
  const { resetTournamentData, isResetting } = useResetTournamentData();
  const { control, handleSubmit, register, reset } = useForm<TournamentFormValues>({
    defaultValues: {
      name: "",
      season: new Date().getUTCFullYear(),
      venue: "",
      status: "setup",
      score_source: "manual",
      external_tournament_key: "",
      auto_refresh_seconds: 45,
      starts_on: "",
      ends_on: "",
      draft_size: 16,
      picks_per_manager: 2,
      is_active: false,
    },
  });

  useEffect(() => {
    if (tournament) {
      reset({
        name: tournament.name,
        season: tournament.season,
        venue: tournament.venue || "",
        status: tournament.status,
        score_source: tournament.score_source,
        external_tournament_key: tournament.external_tournament_key || "",
        auto_refresh_seconds: tournament.auto_refresh_seconds ?? 45,
        starts_on: tournament.starts_on || "",
        ends_on: tournament.ends_on || "",
        draft_size: tournament.draft_size,
        picks_per_manager: tournament.picks_per_manager,
        is_active: tournament.is_active,
      });
    }
  }, [tournament, reset]);

  const onSubmit = (values: TournamentFormValues) => {
    const shouldResetTournament = tournament?.status !== "final" && values.status === "final";

    mutate(
      {
        resource: "golf_tournaments",
        id,
        values: {
          ...values,
          season: Number(values.season),
          draft_size: Number(values.draft_size),
          picks_per_manager: Number(values.picks_per_manager),
          venue: values.venue || null,
          score_source: values.score_source,
          external_tournament_key: values.external_tournament_key || null,
          auto_refresh_seconds:
            values.score_source === "manual" ? null : Number(values.auto_refresh_seconds || 45),
          starts_on: values.starts_on || null,
          ends_on: values.ends_on || null,
        },
      },
      {
        onSuccess: async () => {
          try {
            if (shouldResetTournament) {
              await resetTournamentData(id);
            }

            open?.({
              type: "success",
              message: "Tournament updated",
              description: shouldResetTournament
                ? `${values.name} was marked final and the leaderboard/player pool were reset.`
                : `${values.name} was updated.`,
            });
            navigate(`/tournaments/show/${id}`);
          } catch (error) {
            open?.({
              type: "error",
              message: "Tournament updated, but reset failed",
              description: error instanceof Error ? error.message : "The leaderboard and player pool could not be reset.",
            });
          }
        },
      },
    );
  };

  if (query.isLoading) {
    return (
      <Stack sx={{ minHeight: "60vh" }} alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <GolfPage title={`Edit ${tournament?.name || "Tournament"}`} subtitle="Adjust dates, draft format, and live status.">
      <GolfSection title="Tournament Details">
        <Stack spacing={2.5}>
          <TextField label="Name" {...register("name")} />
          <TextField label="Season" type="number" {...register("season", { valueAsNumber: true })} />
          <TextField label="Venue" {...register("venue")} />
          <TextField select label="Status" {...register("status")}>
            <MenuItem value="setup">Setup</MenuItem>
            <MenuItem value="draft_live">Draft live</MenuItem>
            <MenuItem value="in_progress">In progress</MenuItem>
            <MenuItem value="final">Final</MenuItem>
          </TextField>
          <TextField select label="Score Source" {...register("score_source")}>
            <MenuItem value="manual">Manual</MenuItem>
            <MenuItem value="pga_tour_live">PGA TOUR Live</MenuItem>
            <MenuItem value="sample_masters_live">Sample Masters Live</MenuItem>
          </TextField>
          <TextField
            label="External Tournament Key"
            helperText="For PGA TOUR live scoring, use the official leaderboard id such as R2026014."
            {...register("external_tournament_key")}
          />
          <TextField
            label="Auto Refresh Seconds"
            type="number"
            {...register("auto_refresh_seconds", { valueAsNumber: true })}
          />
          <TextField label="Starts on" type="date" InputLabelProps={{ shrink: true }} {...register("starts_on")} />
          <TextField label="Ends on" type="date" InputLabelProps={{ shrink: true }} {...register("ends_on")} />
          <TextField label="Manager count" type="number" {...register("draft_size", { valueAsNumber: true })} />
          <TextField label="Picks per manager" type="number" {...register("picks_per_manager", { valueAsNumber: true })} />
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                label="Set as active tournament"
              />
            )}
          />
          <SaveButton onClick={handleSubmit(onSubmit)} loading={mutation.isPending || isResetting} />
        </Stack>
      </GolfSection>
    </GolfPage>
  );
};
