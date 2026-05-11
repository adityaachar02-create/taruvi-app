import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { useCreate, useNotification } from "@refinedev/core";
import { SaveButton } from "@refinedev/mui";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import type { ScoreSource, TournamentStatus } from "../../types/golf";

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

export const GolfTournamentCreate = () => {
  const navigate = useNavigate();
  const { open } = useNotification();
  const { mutate, mutation } = useCreate();
  const { control, handleSubmit, register } = useForm<TournamentFormValues>({
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

  const onSubmit = (values: TournamentFormValues) => {
    mutate(
      {
        resource: "golf_tournaments",
        values: {
          id: crypto.randomUUID(),
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
          last_synced_at: null,
          sync_status: "idle",
          sync_message:
            values.score_source === "pga_tour_live"
              ? "Ready to sync the official PGA TOUR leaderboard."
              : values.score_source === "sample_masters_live"
                ? "Ready to sync the sample live leaderboard."
                : "Scores will be managed manually.",
          sync_cursor: null,
        },
      },
      {
        onSuccess: (result) => {
          open?.({ type: "success", message: "Tournament created", description: `${values.name} is ready.` });
          navigate(`/tournaments/show/${result.data.id}`);
        },
      },
    );
  };

  return (
    <GolfPage title="Add Tournament" subtitle="Create a new major week and configure the draft structure.">
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
          <SaveButton onClick={handleSubmit(onSubmit)} loading={mutation.isPending} />
        </Stack>
      </GolfSection>
    </GolfPage>
  );
};
