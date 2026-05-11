import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { useEffect } from "react";
import { useNotification, useOne, useUpdate } from "@refinedev/core";
import { SaveButton } from "@refinedev/mui";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import type { GolfGolfer } from "../../types/golf";

interface GolferFormValues {
  full_name: string;
  country: string;
  world_rank: number | null;
  seed_tier: string;
  is_active: boolean;
}

export const GolfGolferEdit = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { open } = useNotification();
  const { result: golfer, query } = useOne<GolfGolfer>({ resource: "golf_golfers", id });
  const { mutate, mutation } = useUpdate();
  const { control, handleSubmit, register, reset, formState: { errors } } = useForm<GolferFormValues>({
    defaultValues: {
      full_name: "",
      country: "",
      world_rank: null,
      seed_tier: "A",
      is_active: true,
    },
  });

  useEffect(() => {
    if (golfer) {
      reset({
        full_name: golfer.full_name,
        country: golfer.country || "",
        world_rank: golfer.world_rank ?? null,
        seed_tier: golfer.seed_tier || "",
        is_active: golfer.is_active,
      });
    }
  }, [golfer, reset]);

  const onSubmit = (values: GolferFormValues) => {
    mutate(
      {
        resource: "golf_golfers",
        id,
        values: {
          ...values,
          world_rank: values.world_rank ? Number(values.world_rank) : null,
        },
      },
      {
        onSuccess: () => {
          open?.({ type: "success", message: "Golfer updated", description: `${values.full_name} was updated.` });
          navigate(`/golfers/show/${id}`);
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
    <GolfPage title={`Edit ${golfer?.full_name || "Golfer"}`} subtitle="Update ranking, tier, and field availability.">
      <GolfSection title="Golfer Details">
        <Stack spacing={2.5}>
          <TextField
            label="Full name"
            {...register("full_name", { required: "Golfer name is required" })}
            error={!!errors.full_name}
            helperText={errors.full_name?.message}
          />
          <TextField label="Country" {...register("country")} />
          <TextField label="World rank" type="number" {...register("world_rank", { valueAsNumber: true })} />
          <TextField label="Seed tier" {...register("seed_tier")} />
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                label="Active in field"
              />
            )}
          />
          <SaveButton onClick={handleSubmit(onSubmit)} loading={mutation.isPending} />
        </Stack>
      </GolfSection>
    </GolfPage>
  );
};
