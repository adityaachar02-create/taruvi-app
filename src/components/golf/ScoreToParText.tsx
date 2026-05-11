import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import type { Variant } from "@mui/material/styles/createTypography";
import { formatToPar } from "../../utils/golfDraft";

interface ScoreToParTextProps {
  value: number | null | undefined;
  variant?: Variant;
  sx?: SxProps<Theme>;
}

export const ScoreToParText = ({ value, variant = "body2", sx }: ScoreToParTextProps) => {
  const getColor = (theme: Theme) => {
    if (value === null || value === undefined) {
      return theme.palette.text.secondary;
    }

    if (value < 0) {
      return theme.palette.error.main;
    }

    if (value === 0) {
      return theme.palette.success.main;
    }

    return theme.palette.mode === "dark" ? theme.palette.text.primary : "#000000";
  };

  return (
    <Typography variant={variant} sx={{ color: getColor, ...sx }}>
      {formatToPar(value)}
    </Typography>
  );
};
