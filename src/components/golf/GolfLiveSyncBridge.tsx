import { useActiveTournament } from "../../hooks/useActiveTournament";
import { useGolfLiveSync } from "../../hooks/useGolfLiveSync";

export const GolfLiveSyncBridge = () => {
  const { activeTournament } = useActiveTournament();

  useGolfLiveSync(activeTournament);

  return null;
};
