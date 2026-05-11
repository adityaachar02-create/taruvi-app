import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { useCreate, useNotification } from "@refinedev/core";
import { SaveButton } from "@refinedev/mui";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";

interface GolferFormValues {
  full_name: string;
  country: string;
  world_rank: number | null;
  seed_tier: string;
  is_active: boolean;
}

export const GolfGolferCreate = () => {
  const navigate = useNavigate();
  const { open } = useNotification();
  const { mutate, mutation } = useCreate();
  const { control, handleSubmit, register, formState: { errors } } = useForm<GolferFormValues>({
    defaultValues: {
      full_name: "",
      country: "",
      world_rank: null,
      seed_tier: "A",
      is_active: true,
    },
  });

  const onSubmit = (values: GolferFormValues) => {
    mutate(
      {
        resource: "golf_golfers",
        values: {
          id: crypto.randomUUID(),
          ...values,
          world_rank: values.world_rank ? Number(values.world_rank) : null,
        },
      },
      {
        onSuccess: (result) => {
          open?.({ type: "success", message: "Golfer created", description: `${values.full_name} was added to the field.` });
          navigate(`/golfers/show/${result.data.id}`);
        },
      },
    );
  };

  return (
    <GolfPage title="Add Golfer" subtitle="Add a player to the draftable field.">
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
