import { createContext, useContext, useState, ReactNode } from 'react';
import { apiClient, Player, CoachingReport, RankEntry } from '../api/client';
import { MatchData } from '../components/MatchRow';

interface PlayerContextType {
  player: Player | null;
  reports: CoachingReport[];
  ranks: RankEntry[];
  history: MatchData[];
  loading: boolean;
  error: string | null;
  currentRole?: string;
  searchPlayer: (region: string, gameName: string, tagLine: string, role?: string) => Promise<void>;
  clearError: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [reports, setReports] = useState<CoachingReport[]>([]);
  const [ranks, setRanks] = useState<RankEntry[]>([]);
  const [history, setHistory] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string | undefined>(undefined);

  const searchPlayer = async (region: string, gameName: string, tagLine: string, role?: string) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentRole(role);
      const p = await apiClient.getPlayer(region, gameName, tagLine);
      setPlayer(p);
      
      let [r, h, rks] = await Promise.all([
        apiClient.getReports(p.puuid, role),
        apiClient.getMatchHistory(p.puuid, region, role),
        apiClient.getPlayerRanks(region, p.puuid)
      ]);
      
      setReports(r);
      setHistory(h);
      setRanks(rks);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error fetching player. Ensure backend is running and player exists.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PlayerContext.Provider value={{ player, reports, ranks, history, loading, error, currentRole, searchPlayer, clearError: () => setError(null) }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
