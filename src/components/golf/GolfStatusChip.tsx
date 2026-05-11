import Chip from "@mui/material/Chip";
import type { TournamentStatus } from "../../types/golf";
import { getTournamentStatusLabel } from "../../utils/golfDraft";

interface GolfStatusChipProps {
  status: TournamentStatus;
}

export const GolfStatusChip = ({ status }: GolfStatusChipProps) => {
  const color =
    status === "draft_live"
      ? "warning"
      : status === "in_progress" || status === "final"
        ? "success"
        : "default";

  return <Chip size="small" label={getTournamentStatusLabel(status)} color={color} variant="outlined" />;
};
