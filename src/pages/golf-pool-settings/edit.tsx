import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { useEffect } from "react";
import { useList, useNotification, useOne, useUpdate } from "@refinedev/core";
import { SaveButton } from "@refinedev/mui";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import type { GolfPoolSettings, GolfTournament } from "../../types/golf";

interface PoolSettingsFormValues {
  pool_name: string;
  tagline: string;
  commissioner_name: string;
  default_tournament_id: string;
  leaderboard_tiebreaker: GolfPoolSettings["leaderboard_tiebreaker"];
  show_world_rank: boolean;
  show_country: boolean;
  allow_manual_scores: boolean;
  draft_clock_enabled: boolean;
  draft_clock_seconds: number | null;
  highlight_seed_tiers: boolean;
}

export const GolfPoolSettingsEdit = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { open } = useNotification();
  const { result: setting, query } = useOne<GolfPoolSettings>({ resource: "golf_pool_settings", id });
  const tournamentsQuery = useList<GolfTournament>({ resource: "golf_tournaments", pagination: { mode: "off" } });
  const { mutate, mutation } = useUpdate();
  const { control, handleSubmit, register, reset } = useForm<PoolSettingsFormValues>({
    defaultValues: {
      pool_name: "",
      tagline: "",
      commissioner_name: "",
      default_tournament_id: "",
      leaderboard_tiebreaker: "total_to_par",
      show_world_rank: true,
      show_country: true,
      allow_manual_scores: true,
      draft_clock_enabled: false,
      draft_clock_seconds: 90,
      highlight_seed_tiers: true,
    },
  });

  useEffect(() => {
    if (setting) {
      reset({
        pool_name: setting.pool_name,
        tagline: setting.tagline || "",
        commissioner_name: setting.commissioner_name || "",
        default_tournament_id: (setting.default_tournament_id as string) || "",
        leaderboard_tiebreaker: setting.leaderboard_tiebreaker,
        show_world_rank: setting.show_world_rank,
        show_country: setting.show_country,
        allow_manual_scores: setting.allow_manual_scores,
        draft_clock_enabled: setting.draft_clock_enabled,
        draft_clock_seconds: setting.draft_clock_seconds ?? 90,
        highlight_seed_tiers: setting.highlight_seed_tiers,
      });
    }
  }, [setting, reset]);

  const onSubmit = (values: PoolSettingsFormValues) => {
    mutate(
      {
        resource: "golf_pool_settings",
        id,
        values: {
          ...values,
          default_tournament_id: values.default_tournament_id || null,
          draft_clock_seconds: values.draft_clock_seconds ? Number(values.draft_clock_seconds) : null,
        },
      },
      {
        onSuccess: () => {
          open?.({ type: "success", message: "Settings updated", description: "Pool configuration is live." });
          navigate("/settings");
        },
      },
    );
  };

  if (query.isLoading || tournamentsQuery.query.isLoading) {
    return (
      <Stack sx={{ minHeight: "60vh" }} alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <GolfPage title="Edit Pool Settings" subtitle="Control the naming, display, and tiebreaker rules for the app.">
      <GolfSection title="Settings">
        <Stack spacing={2.5}>
          <TextField label="Pool name" {...register("pool_name")} />
          <TextField label="Tagline" multiline minRows={3} {...register("tagline")} />
          <TextField label="Commissioner name" {...register("commissioner_name")} />
          <TextField select label="Default tournament" {...register("default_tournament_id")}>
            <MenuItem value="">None</MenuItem>
            {(tournamentsQuery.result?.data ?? []).map((tournament) => (
              <MenuItem key={tournament.id} value={tournament.id}>
                {tournament.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Leaderboard tiebreaker" {...register("leaderboard_tiebreaker")}>
            <MenuItem value="total_to_par">Lowest team score to par</MenuItem>
            <MenuItem value="scored_golfers">More scored golfers</MenuItem>
            <MenuItem value="draft_slot">Earlier draft slot</MenuItem>
          </TextField>
          <TextField label="Draft clock seconds" type="number" {...register("draft_clock_seconds", { valueAsNumber: true })} />
          <Controller
            control={control}
            name="show_world_rank"
            render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />} label="Show world ranking" />}
          />
          <Controller
            control={control}
            name="show_country"
            render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />} label="Show country" />}
          />
          <Controller
            control={control}
            name="allow_manual_scores"
            render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />} label="Allow manual score entry" />}
          />
          <Controller
            control={control}
            name="draft_clock_enabled"
            render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />} label="Enable draft clock" />}
          />
          <Controller
            control={control}
            name="highlight_seed_tiers"
            render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />} label="Highlight seed tiers" />}
          />
          <SaveButton onClick={handleSubmit(onSubmit)} loading={mutation.isPending} />
        </Stack>
      </GolfSection>
    </GolfPage>
  );
};
