import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { useEffect } from "react";
import { useList, useNotification, useOne, useUpdate } from "@refinedev/core";
import { SaveButton } from "@refinedev/mui";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import type { GolfGolfer, GolfScore, GolfTournament } from "../../types/golf";

interface ScoreFormValues {
  position_label: string;
  to_par: number | null;
  thru: string;
  today_score: number | null;
  strokes: number | null;
  is_cut: boolean;
}

export const GolfScoreEdit = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { open } = useNotification();
  const { result: score, query } = useOne<GolfScore>({ resource: "golf_scores", id });
  const golfersQuery = useList<GolfGolfer>({ resource: "golf_golfers", pagination: { mode: "off" } });
  const tournamentsQuery = useList<GolfTournament>({ resource: "golf_tournaments", pagination: { mode: "off" } });
  const { mutate, mutation } = useUpdate();
  const { control, handleSubmit, register, reset } = useForm<ScoreFormValues>({
    defaultValues: {
      position_label: "",
      to_par: null,
      thru: "",
      today_score: null,
      strokes: null,
      is_cut: false,
    },
  });

  useEffect(() => {
    if (score) {
      reset({
        position_label: score.position_label || "",
        to_par: score.to_par ?? null,
        thru: score.thru || "",
        today_score: score.today_score ?? null,
        strokes: score.strokes ?? null,
        is_cut: score.is_cut,
      });
    }
  }, [score, reset]);

  const onSubmit = (values: ScoreFormValues) => {
    mutate(
      {
        resource: "golf_scores",
        id,
        values: {
          ...values,
          updated_at: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          open?.({ type: "success", message: "Score updated", description: "Leaderboard data has been refreshed." });
          navigate(`/scores/show/${id}`);
        },
      },
    );
  };

  if (query.isLoading || golfersQuery.query.isLoading || tournamentsQuery.query.isLoading) {
    return (
      <Stack sx={{ minHeight: "60vh" }} alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  const golfer = golfersQuery.result?.data?.find((item) => item.id === score?.golfer_id);
  const tournament = tournamentsQuery.result?.data?.find((item) => item.id === score?.tournament_id);

  return (
    <GolfPage title={`Edit ${golfer?.full_name || "Score"}`} subtitle={tournament?.name || "Tournament score row"}>
      <GolfSection title="Score Details">
        <Stack spacing={2.5}>
          <TextField label="Golfer" value={golfer?.full_name || ""} disabled />
          <TextField label="Tournament" value={tournament?.name || ""} disabled />
          <TextField label="Position" {...register("position_label")} />
          <TextField label="To par" type="number" {...register("to_par", { valueAsNumber: true })} />
          <TextField label="Thru" {...register("thru")} />
          <TextField label="Today score" type="number" {...register("today_score", { valueAsNumber: true })} />
          <TextField label="Strokes" type="number" {...register("strokes", { valueAsNumber: true })} />
          <Controller
            control={control}
            name="is_cut"
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                label="Player missed the cut"
              />
            )}
          />
          <SaveButton onClick={handleSubmit(onSubmit)} loading={mutation.isPending} />
        </Stack>
      </GolfSection>
    </GolfPage>
  );
};
