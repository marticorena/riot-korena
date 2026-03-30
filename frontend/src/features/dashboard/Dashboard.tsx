import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Activity, Trophy, Crosshair, AlertCircle, X } from 'lucide-react'
import { getLatestDDragonVersion, getProfileIconUrl } from '../../lib/ddragon'
import { ProBenchmark } from './ProBenchmark'
import { MatchRow } from '../../components/MatchRow'
import { usePlayer } from '../../contexts/PlayerContext'

/**
 * Properties for the dynamic statistic card.
 */
interface StatCardProps {
  title: string
  value: React.ReactNode
  themeColor: 'rose' | 'cyan' | 'amber'
  icon: React.ElementType
  children: React.ReactNode
}

/**
 * Reusable abstract statistic card respecting DRY principles.
 */
function StatCard({ title, value, themeColor, icon: Icon, children }: StatCardProps) {
  const colorMap = {
    rose: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] text-rose-500 bg-rose-500/10 text-rose-400 bg-rose-500/20',
    cyan: 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] text-cyan-500 bg-cyan-500/10 text-cyan-400 bg-cyan-500/20',
    amber: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] text-amber-500 bg-amber-500/10 text-amber-400 bg-amber-500/20 ring-amber-500/50',
  }
  
  // Quick tailwind mapping for strict JIT compatibility.
  const [baseBg, , iconColor, iconBgTint] = colorMap[themeColor].split(' ')

  return (
    <Card className="relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-1.5 h-full ${baseBg}`} />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${iconBgTint} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black text-white capitalize mb-4 group-hover:scale-105 transition-transform origin-left">
          {value}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

/**
 * Main coaching intelligence dashboard view.
 */
export function Dashboard() {
  const { player, reports, ranks, history, error, clearError } = usePlayer()
  const [ddragonVersion, setDdragonVersion] = useState<string>('14.5.1')

  useEffect(() => {
    getLatestDDragonVersion().then(setDdragonVersion).catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeReport = reports.length > 0 ? reports[0] : null
  return (
    <div className="min-h-full p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-8 relative">
        
        {/* --- Error Toast Notification --- */}
        {error && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#111424]/90 border border-rose-500/50 text-rose-200 px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(244,63,94,0.3)] backdrop-blur-xl animate-in slide-in-from-top-4 fade-in duration-300 w-max max-w-[90vw]">
            <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
            <p className="text-sm font-medium pr-4">{error}</p>
            <button onClick={() => clearError()} className="ml-auto p-1 rounded-full hover:bg-rose-500/20 text-rose-400 hover:text-rose-200 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}



        {player && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* Player Banner Strip with Ranks */}
             <div className="flex items-center gap-4 p-4 rounded-xl bg-[#111424] border border-[#1e2336]">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-2xl font-black text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] relative border-2 border-slate-900">
                  {player.profile_icon_id !== undefined && player.profile_icon_id !== null ? (
                    <img src={getProfileIconUrl(player.profile_icon_id, ddragonVersion)} alt="Icon" className="w-full h-full object-cover relative z-10" />
                  ) : (
                    player.game_name.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                    {player.game_name} <span className="text-sm font-normal text-slate-500">#{player.tag_line}</span>
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#1e2336] text-slate-300">Level {player.summoner_level ?? '?'}</span>
                  </div>
                </div>

                {/* Inline Rank Badges */}
                <div className="flex items-center gap-4 ml-auto">
                  {(() => {
                    const soloQ = ranks.find(r => r.queueType === 'RANKED_SOLO_5x5')
                    return (
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 flex items-center justify-center">
                          {soloQ?.tier ? (
                            <img src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/${soloQ.tier.toLowerCase()}.png`} className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]" alt={soloQ.tier} />
                          ) : (
                            <div className="w-8 h-8 rounded-full border border-dashed border-[#1e2336]" />
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-white capitalize">{soloQ?.tier ? `${soloQ.tier} ${soloQ.rank}` : 'Unranked'}</div>
                          <div className="text-[10px] font-medium text-slate-500">{soloQ ? `${soloQ.leaguePoints ?? 0} LP · Solo/Duo` : 'Solo/Duo'}</div>
                        </div>
                      </div>
                    )
                  })()}
                  {(() => {
                    const flexQ = ranks.find(r => r.queueType === 'RANKED_FLEX_SR')
                    return (
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 flex items-center justify-center">
                          {flexQ?.tier ? (
                            <img src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/${flexQ.tier.toLowerCase()}.png`} className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]" alt={flexQ.tier} />
                          ) : (
                            <div className="w-8 h-8 rounded-full border border-dashed border-[#1e2336]" />
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-white capitalize">{flexQ?.tier ? `${flexQ.tier} ${flexQ.rank}` : 'Unranked'}</div>
                          <div className="text-[10px] font-medium text-slate-500">{flexQ ? `${flexQ.leaguePoints ?? 0} LP · Flex` : 'Flex'}</div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
             </div>

             <div className="grid gap-6 md:grid-cols-3">
               <StatCard 
                 title="Critical Moments" 
                 value={String(activeReport?.critical_moments?.deaths_before_objectives ?? 0)} 
                 themeColor="rose" 
                 icon={Activity}
               >
                 <div className="flex items-center gap-2">
                   <span className="px-2 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-400">High Priority</span>
                   <p className="text-xs font-medium text-slate-500">Deaths before objectives spawn</p>
                 </div>
               </StatCard>

               <StatCard 
                 title="Core Habits" 
                 value={String(activeReport?.habits?.ward_placement_efficiency ?? "Insufficient Data")} 
                 themeColor="cyan" 
                 icon={Crosshair}
               >
                 <div className="w-full bg-[#1e2336] h-2 rounded-full overflow-hidden mb-2">
                   <div className="bg-cyan-500 h-full w-[85%] shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                 </div>
                 <p className="text-xs font-medium text-slate-500">Vision control efficiency score</p>
               </StatCard>

               <StatCard 
                 title="Training Plan" 
                 value={
                   <span className="text-sm font-bold tracking-normal leading-tight text-white normal-case relative z-10 block line-clamp-3">
                     {activeReport?.training_plan?.focus ? (String(activeReport.training_plan.focus).split('|')[0] || '') : "Aggregate more matches"}
                   </span>
                 } 
                 themeColor="amber" 
                 icon={Trophy}
               >
                 <div className="flex items-center gap-2 mt-2">
                   <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-black shrink-0 text-amber-500 ring-1 ring-amber-500/50">1</span>
                   <p className="text-xs font-medium text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis">Primary focus recommendation</p>
                 </div>
               </StatCard>
             </div>
             
             <div className="grid gap-6 md:grid-cols-2 mt-6">
                {/* Timeline Chart */}
                <Card className="border-[#1e2336] bg-[#111424]">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-white flex items-center gap-2 justify-between">
                      <span>Match Event Timeline</span>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Heuristics Generated</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[240px] flex flex-col p-0">
                    {activeReport?.critical_moments?.event_timeline && (activeReport.critical_moments.event_timeline as Array<any>).length > 0 ? (
                      <>
                        {/* Legend */}
                        <div className="flex items-center gap-4 px-4 pt-2 pb-1 text-[10px] font-bold tracking-wide">
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-slate-500">Deaths</span></div>
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-slate-500">Kills</span></div>
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-500"></div><span className="text-slate-500">Objectives</span></div>
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-600"></div><span className="text-slate-500">Wards</span></div>
                        </div>
                        {/* Chart area */}
                        <div className="w-full flex-1 flex items-end gap-[2px] px-4 pb-4 pt-2">
                          {(() => {
                            const events = activeReport.critical_moments.event_timeline as Array<any>;
                            const maxTs = Math.max(...events.map(e => e.timestamp), 1);
                            return events.map((ev, i) => {
                              const colorClass = ev.color === 'red' ? 'bg-rose-500' : (ev.color === 'green' ? 'bg-emerald-500' : (ev.color === 'cyan' ? 'bg-cyan-500' : 'bg-slate-600'))
                              // Height based on position in game timeline (later events = taller to show progression)
                              const timeRatio = ev.timestamp / maxTs;
                              const baseHeight = ev.type === 'DEATH' || ev.type === 'KILL' ? 60 : (ev.type === 'OBJECTIVE' ? 80 : 25);
                              const heightPct = Math.max(15, baseHeight * (0.4 + timeRatio * 0.6));
                              const minutes = Math.floor(ev.timestamp / 60);
                              const seconds = Math.floor(ev.timestamp % 60);
                              return (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end group relative" style={{ height: '100%' }}>
                                  {/* Tooltip */}
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-[9px] font-bold text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30 shadow-lg">
                                    {ev.type} · {minutes}:{seconds.toString().padStart(2, '0')}
                                  </div>
                                  <div 
                                    className={`w-full rounded-t-sm ${colorClass} transition-all duration-300 hover:brightness-125 cursor-crosshair`} 
                                    style={{ height: `${heightPct}%` }}
                                  />
                                </div>
                              )
                            })
                          })()}
                        </div>
                        {/* Time axis */}
                        <div className="flex justify-between px-4 pb-2 text-[9px] font-bold text-slate-600">
                          <span>0:00</span>
                          <span>{(() => {
                            const events = activeReport.critical_moments.event_timeline as Array<any>;
                            const maxTs = Math.max(...events.map(e => e.timestamp), 1);
                            return `${Math.floor(maxTs / 60)}:${Math.floor(maxTs % 60).toString().padStart(2, '0')}`;
                          })()}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-500 text-sm flex w-full h-full items-center justify-center font-medium">Awaiting Match Analysis...</div>
                    )}
                  </CardContent>
                </Card>

                {/* Pro Benchmark Component */}
                <ProBenchmark report={activeReport} />
             </div>

             {/* Match History Feed */}
             <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-[#1e2336]">
                  <h3 className="text-base font-bold text-white">Recent Ranked Games</h3>
                  <span className="text-xs font-medium text-slate-500 bg-[#1e2336] px-2 py-1 rounded">Last 5 Matches</span>
                </div>

                <div className="flex flex-col gap-3 py-2">
                  {history.length > 0 ? (
                    history.map((match, idx) => (
                      <MatchRow key={match.match_id ?? idx} match={match} ddragonVersion={ddragonVersion} />
                    ))
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed border-[#1e2336] rounded-xl text-slate-500 font-medium">
                       No recent ranked matches found for this Riot ID.
                    </div>
                  )}
                </div>
             </div>

          </div>
        )}
      </div>
    </div>
  )
}
