import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { useList, useNotification, useOne, useUpdate } from "@refinedev/core";
import { SaveButton } from "@refinedev/mui";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import type { GolfManager } from "../../types/golf";

interface ManagerFormValues {
  display_name: string;
  draft_slot: number;
  color_hex: string;
  is_commissioner: boolean;
}

export const GolfManagerEdit = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { open } = useNotification();
  const { result: manager, query } = useOne<GolfManager>({ resource: "golf_managers", id });
  const managersQuery = useList<GolfManager>({
    resource: "golf_managers",
    pagination: { mode: "off" },
  });
  const { mutate, mutation } = useUpdate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { control, handleSubmit, register, reset, formState: { errors } } = useForm<ManagerFormValues>({
    defaultValues: {
      display_name: "",
      draft_slot: 1,
      color_hex: "#2f7d32",
      is_commissioner: false,
    },
  });

  useEffect(() => {
    if (manager) {
      reset({
        display_name: manager.display_name,
        draft_slot: manager.draft_slot,
        color_hex: manager.color_hex || "",
        is_commissioner: manager.is_commissioner,
      });
    }
  }, [manager, reset]);

  const onSubmit = (values: ManagerFormValues) => {
    const normalizedName = values.display_name.trim();
    const normalizedSlot = Number(values.draft_slot);
    const otherManagers = (managersQuery.result?.data ?? []).filter((item) => item.id !== id);

    if (!normalizedName) {
      setSubmitError("Display name is required.");
      return;
    }

    if (otherManagers.some((item) => item.display_name.toLowerCase() === normalizedName.toLowerCase())) {
      setSubmitError(`A manager named "${normalizedName}" already exists.`);
      return;
    }

    if (otherManagers.some((item) => item.draft_slot === normalizedSlot)) {
      setSubmitError(`Draft slot ${normalizedSlot} is already assigned to another manager.`);
      return;
    }

    setSubmitError(null);
    mutate(
      {
        resource: "golf_managers",
        id,
        values: {
          ...values,
          display_name: normalizedName,
          draft_slot: normalizedSlot,
          color_hex: values.color_hex.trim() || null,
        },
      },
      {
        onSuccess: () => {
          open?.({ type: "success", message: "Manager updated", description: `${normalizedName} has been updated.` });
          navigate(`/managers/show/${id}`);
        },
        onError: (error) => {
          const description = error.message || "The manager could not be updated.";
          setSubmitError(description);
          open?.({ type: "error", message: "Update failed", description });
        },
      },
    );
  };

  if (query.isLoading || managersQuery.query.isLoading) {
    return (
      <Stack sx={{ minHeight: "60vh" }} alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <GolfPage title={`Edit ${manager?.display_name || "Manager"}`} subtitle="Adjust draft order, color, or commissioner status.">
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
