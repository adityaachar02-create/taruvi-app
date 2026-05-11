import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { useCreate, useList, useNotification } from "@refinedev/core";
import { SaveButton } from "@refinedev/mui";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import type { GolfManager } from "../../types/golf";

interface ManagerFormValues {
  display_name: string;
  draft_slot: number;
  color_hex: string;
  is_commissioner: boolean;
}

export const GolfManagerCreate = () => {
  const navigate = useNavigate();
  const { open } = useNotification();
  const { mutate, mutation } = useCreate();
  const managersQuery = useList<GolfManager>({
    resource: "golf_managers",
    pagination: { mode: "off" },
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { control, handleSubmit, register, formState: { errors } } = useForm<ManagerFormValues>({
    defaultValues: {
      display_name: "",
      draft_slot: 1,
      color_hex: "#2f7d32",
      is_commissioner: false,
    },
  });

  const onSubmit = (values: ManagerFormValues) => {
    const normalizedName = values.display_name.trim();
    const normalizedSlot = Number(values.draft_slot);
    const managers = managersQuery.result?.data ?? [];

    if (!normalizedName) {
      setSubmitError("Display name is required.");
      return;
    }

    if (managers.some((manager) => manager.display_name.toLowerCase() === normalizedName.toLowerCase())) {
      setSubmitError(`A manager named "${normalizedName}" already exists.`);
      return;
    }

    if (managers.some((manager) => manager.draft_slot === normalizedSlot)) {
      setSubmitError(`Draft slot ${normalizedSlot} is already assigned to another manager.`);
      return;
    }

    setSubmitError(null);
    mutate(
      {
        resource: "golf_managers",
        values: {
          id: crypto.randomUUID(),
          ...values,
          display_name: normalizedName,
          draft_slot: normalizedSlot,
          color_hex: values.color_hex.trim() || null,
        },
      },
      {
        onSuccess: (result) => {
          open?.({ type: "success", message: "Manager created", description: `${normalizedName} joined the pool.` });
          navigate(`/managers/show/${result.data.id}`);
        },
        onError: (error) => {
          const description = error.message || "The manager could not be created.";
          setSubmitError(description);
          open?.({ type: "error", message: "Create failed", description });
        },
      },
    );
  };

  return (
    <GolfPage title="Add Manager" subtitle="Create a new participant and assign their draft position.">
      <GolfSection title="Manager Details">
        <Stack spacing={2.5}>
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
          <TextField
            label="Display name"
            {...register("display_name", { required: "Display name is required" })}
            error={!!errors.display_name}
            helperText={errors.display_name?.message}
          />
          <TextField
            label="Draft slot"
            type="number"
            {...register("draft_slot", {
              required: "Draft slot is required",
              valueAsNumber: true,
              min: { value: 1, message: "Draft slot must be at least 1" },
            })}
            error={!!errors.draft_slot}
            helperText={errors.draft_slot?.message}
          />
          <TextField label="Color" {...register("color_hex")} />
          <Controller
            control={control}
            name="is_commissioner"
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                label="Commissioner access"
              />
            )}
          />
          <SaveButton onClick={handleSubmit(onSubmit)} loading={mutation.isPending} />
        </Stack>
      </GolfSection>
    </GolfPage>
  );
};
