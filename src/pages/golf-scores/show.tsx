import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useList, useOne } from "@refinedev/core";
import { EditButton } from "@refinedev/mui";
import { useParams } from "react-router";
import { GolfPage, GolfSection } from "../../components/golf/GolfPage";
import { ScoreToParText } from "../../components/golf/ScoreToParText";
import type { GolfGolfer, GolfScore, GolfTournament } from "../../types/golf";
import { getEffectiveScoreToPar, MISSED_CUT_PENALTY } from "../../utils/golfDraft";

export const GolfScoreShow = () => {
  const { id = "" } = useParams();
  const { result: score, query } = useOne<GolfScore>({ resource: "golf_scores", id });
  const golfersQuery = useList<GolfGolfer>({ resource: "golf_golfers", pagination: { mode: "off" } });
  const tournamentsQuery = useList<GolfTournament>({ resource: "golf_tournaments", pagination: { mode: "off" } });

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
    <GolfPage
      title={golfer?.full_name || "Score"}
      subtitle={tournament?.name || "Tournament score row"}
      actions={<EditButton resource="golf_scores" recordItemId={id}>Edit Score</EditButton>}
    >
      <GolfSection title="Score Row">
        <Stack spacing={1}>
          <Typography>Position: {score?.position_label || "—"}</Typography>
          <Stack direction="row" spacing={0.75} alignItems="baseline">
            <Typography>To par:</Typography>
            <ScoreToParText value={getEffectiveScoreToPar(score)} />
          </Stack>
          <Typography>Thru: {score?.thru || "—"}</Typography>
          <Typography>Today: {score?.today_score ?? "—"}</Typography>
          <Typography>Strokes: {score?.strokes ?? "—"}</Typography>
          <Typography>Cut: {score?.is_cut ? "Yes" : "No"}</Typography>
          {score?.is_cut ? <Typography>Missed-cut penalty applied: +{MISSED_CUT_PENALTY}</Typography> : null}
          <Typography>Updated: {score?.updated_at || "—"}</Typography>
        </Stack>
      </GolfSection>
    </GolfPage>
  );
};
