import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { CoachingReport, apiClient } from '../../api/client'
import { PRO_PLAYERS, CachedProPlayer } from '../../lib/constants'
import { usePlayer } from '../../contexts/PlayerContext'
import { Loader2, Search } from 'lucide-react'

interface ProBenchmarkProps {
  report: CoachingReport | null;
}

const ROLE_MAP: Record<string, string> = {
  'TOP': 'Top',
  'JUNGLE': 'Jungle',
  'MIDDLE': 'Mid',
  'BOTTOM': 'Bot',
  'UTILITY': 'Support',
};

/**
 * Renders statistical progression comparison relative to a stored Pro baseline dynamically.
 * Supports both preset pro players and custom Riot ID lookups.
 */
export function ProBenchmark({ report }: ProBenchmarkProps) {
  const [targetId, setTargetId] = useState<string>(PRO_PLAYERS[0].id);
  const [proReport, setProReport] = useState<CoachingReport | null>(null);
  const [loadingPro, setLoadingPro] = useState<boolean>(false);
  
  // Custom player comparison state
  const [customMode, setCustomMode] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customTag, setCustomTag] = useState<string>('');
  const [customRegion, setCustomRegion] = useState<string>('KR');
  const [activeCustomLabel, setActiveCustomLabel] = useState<string>('');
  
  const { currentRole } = usePlayer();

  // Filter pro players by the currently selected role
  const filteredPros = currentRole 
    ? PRO_PLAYERS.filter(p => {
        const roleMap: Record<string, string> = {
          'TOP': 'Top', 'JUNGLE': 'Jungle', 'MIDDLE': 'Mid', 'BOTTOM': 'ADC', 'UTILITY': 'Support'
        };
        return p.displayRole === roleMap[currentRole];
      })
    : PRO_PLAYERS;

  const selectedTarget = PRO_PLAYERS.find(p => p.id === targetId) || PRO_PLAYERS[0];
  const displayLabel = customMode && activeCustomLabel ? activeCustomLabel : selectedTarget.gameName;
  
  // Fetch pro baseline
  useEffect(() => {
    if (customMode) return; // Don't auto-fetch in custom mode
    let mounted = true;
    async function loadProBaseline() {
       setLoadingPro(true);
       try {
         const p = await apiClient.getPlayer(selectedTarget.region, selectedTarget.gameName, selectedTarget.tagLine);
         const reports = await apiClient.getReports(p.puuid, currentRole);
         
         if (!mounted) return;

         if (reports && reports.length > 0) {
            setProReport(reports[0]);
         } else {
            if (mounted) setProReport(null);
         }
       } catch (err) {
         console.error("Failed to fetch Pro Baseline:", err);
         if (mounted) setProReport(null);
       } finally {
         if (mounted) setLoadingPro(false);
       }
    }
    loadProBaseline();
    return () => { mounted = false; };
  }, [targetId, currentRole, selectedTarget.region, selectedTarget.gameName, selectedTarget.tagLine, customMode]);

  // Handle custom player search
  const handleCustomSearch = async () => {
    if (!customName || !customTag) return;
    setLoadingPro(true);
    try {
      const p = await apiClient.getPlayer(customRegion, customName, customTag);
      const reports = await apiClient.getReports(p.puuid, currentRole);
      setActiveCustomLabel(customName);
      if (reports && reports.length > 0) {
        setProReport(reports[0]);
      } else {
        setProReport(null);
      }
    } catch (err) {
      console.error("Failed to fetch custom player:", err);
      setProReport(null);
      setActiveCustomLabel(customName);
    } finally {
      setLoadingPro(false);
    }
  };

  // Read resolved dynamic baseline 
  const baselineMetrics = {
    visionScorePerMinute: Number(proReport?.habits?.vision_score_per_minute ?? 0),
    kda: Number(((proReport?.habits as any)?.kda ?? 0)),
    killParticipation: Number(proReport?.habits?.kill_participation_percent ?? 0)
  };

  const userStats = {
    vision_score_per_minute: Number(report?.habits?.vision_score_per_minute ?? 0),
    kda: Number(((report?.habits as any)?.kda ?? 0)),
    kill_participation_percent: Number(report?.habits?.kill_participation_percent ?? 0)
  };

  const metrics = [
    {
      label: 'Vision Score / Min',
      user: userStats.vision_score_per_minute,
      pro: baselineMetrics.visionScorePerMinute,
      format: (v: number) => v.toFixed(1),
    },
    {
      label: 'KDA Ratio',
      user: userStats.kda,
      pro: baselineMetrics.kda,
      format: (v: number) => v.toFixed(2),
    },
    {
      label: 'Kill Participation',
      user: userStats.kill_participation_percent,
      pro: baselineMetrics.killParticipation,
      format: (v: number) => `${v.toFixed(1)}%`,
    }
  ];

  const roleLabel = currentRole ? ROLE_MAP[currentRole] || currentRole : 'All Roles';

  return (
    <Card className="border-[#1e2336] bg-[#111424]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-white flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span>Benchmark Comparison</span>
            {/* Toggle between preset pros and custom */}
            <div className="flex items-center gap-1 bg-[#1e2336] rounded-lg p-0.5">
              <button 
                onClick={() => setCustomMode(false)} 
                className={`text-[10px] font-black tracking-wide px-2 py-1 rounded-md transition-colors ${!customMode ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                PROS
              </button>
              <button 
                onClick={() => setCustomMode(true)} 
                className={`text-[10px] font-black tracking-wide px-2 py-1 rounded-md transition-colors ${customMode ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                CUSTOM
              </button>
            </div>
          </div>
          
          {!customMode ? (
            <select 
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              disabled={loadingPro}
              className="text-[12px] font-black tracking-wide bg-[#1e2336] text-purple-400 px-3 py-1.5 rounded cursor-pointer outline-none border border-purple-500/20 shadow-inner disabled:opacity-50 w-full"
            >
              {filteredPros.length > 0 ? (
                filteredPros.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#111424]">{p.gameName} ({p.displayRole})</option>
                ))
              ) : (
                PRO_PLAYERS.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#111424]">{p.gameName} ({p.displayRole})</option>
                ))
              )}
            </select>
          ) : (
            <div className="flex items-center gap-2">
              <select 
                value={customRegion} 
                onChange={e => setCustomRegion(e.target.value)}
                className="text-[11px] font-bold bg-[#1e2336] text-slate-400 px-2 py-1.5 rounded outline-none border border-[#1e2336] appearance-none cursor-pointer"
              >
                <option value="KR">KR</option>
                <option value="NA1">NA</option>
                <option value="EUW1">EUW</option>
                <option value="LA2">LAS</option>
                <option value="LA1">LAN</option>
                <option value="BR1">BR</option>
              </select>
              <input 
                value={customName} 
                onChange={e => setCustomName(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleCustomSearch()}
                placeholder="Riot ID" 
                className="flex-1 text-[12px] font-medium bg-[#1e2336] text-white px-2 py-1.5 rounded outline-none border border-[#1e2336] placeholder:text-slate-600"
              />
              <input 
                value={customTag} 
                onChange={e => setCustomTag(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleCustomSearch()}
                placeholder="#TAG" 
                className="w-16 text-[12px] font-medium bg-[#1e2336] text-slate-300 px-2 py-1.5 rounded outline-none border border-[#1e2336] placeholder:text-slate-600"
              />
              <button 
                onClick={handleCustomSearch} 
                disabled={loadingPro || !customName || !customTag}
                className="bg-cyan-500 hover:bg-cyan-400 text-[#090b14] p-1.5 rounded transition-colors disabled:opacity-50"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </CardTitle>
        
        {/* Context info */}
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            Role Filter: {roleLabel}
          </span>
          <span className="text-[10px] font-bold text-slate-600">·</span>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            Based on latest ranked match
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {loadingPro ? (
          <div className="h-full w-full flex flex-col items-center justify-center p-6 space-y-4">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-sm font-bold text-slate-400">Fetching comparison data...</p>
          </div>
        ) : report ? (
          <div className="space-y-5">
            {/* Legend */}
            <div className="flex items-center gap-6 text-[11px] font-bold tracking-wide">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-cyan-500"></div>
                <span className="text-slate-400">You</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-purple-500"></div>
                <span className="text-slate-400">{displayLabel}</span>
              </div>
            </div>

            {metrics.map((m, idx) => {
               const maxVal = Math.max(m.user, m.pro, 0.1);
               const userPct = Math.min((m.user / maxVal) * 100, 100);
               const proPct = Math.min((m.pro / maxVal) * 100, 100);
               const userWins = m.user >= m.pro;
               
               return (
                 <div key={idx} className="space-y-2">
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                     {m.label}
                   </div>
                   
                   <div className="space-y-1.5">
                     {/* User Bar */}
                     <div className="flex items-center gap-3">
                       <div className="relative flex-1 h-5 bg-[#1e2336] rounded-md overflow-hidden">
                         <div 
                           className={`absolute inset-y-0 left-0 rounded-md transition-all duration-1000 ease-out ${userWins ? 'bg-gradient-to-r from-cyan-600 to-cyan-400' : 'bg-gradient-to-r from-cyan-800/60 to-cyan-600/60'}`}
                           style={{ width: `${userPct}%` }}
                         >
                           <div className={`absolute inset-0 rounded-md ${userWins ? 'shadow-[0_0_12px_rgba(6,182,212,0.4)]' : ''}`}></div>
                         </div>
                       </div>
                       <span className={`text-sm font-black tabular-nums w-16 text-right ${userWins ? 'text-cyan-400' : 'text-cyan-600'}`}>
                         {m.format(m.user)}
                       </span>
                     </div>
                     
                     {/* Comparison Bar */}
                     <div className="flex items-center gap-3">
                       <div className="relative flex-1 h-5 bg-[#1e2336] rounded-md overflow-hidden">
                         <div 
                           className={`absolute inset-y-0 left-0 rounded-md transition-all duration-1000 ease-out ${!userWins ? 'bg-gradient-to-r from-purple-600 to-purple-400' : 'bg-gradient-to-r from-purple-800/60 to-purple-600/60'}`}
                           style={{ width: `${proPct}%` }}
                         >
                           <div className={`absolute inset-0 rounded-md ${!userWins ? 'shadow-[0_0_12px_rgba(168,85,247,0.4)]' : ''}`}></div>
                         </div>
                       </div>
                       <span className={`text-sm font-black tabular-nums w-16 text-right ${!userWins ? 'text-purple-400' : 'text-purple-600'}`}>
                         {m.format(m.pro)}
                       </span>
                     </div>
                   </div>

                   <div className="flex justify-end">
                     <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                       userWins 
                         ? 'bg-emerald-500/15 text-emerald-400' 
                         : 'bg-rose-500/15 text-rose-400'
                     }`}>
                       {userWins ? '▲ Ahead' : '▼ Behind'}
                     </span>
                   </div>
                 </div>
               );
             })}
          </div>
        ) : (
           <p className="text-sm text-slate-500 font-medium pb-2">No valid report history to compare.</p>
        )}
      </CardContent>
    </Card>
  );
}
