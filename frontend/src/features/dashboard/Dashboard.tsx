import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { apiClient, CoachingReport, Player } from '../../api/client'
import { Activity, Trophy, Crosshair, Search, Loader2 } from 'lucide-react'

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
  const [gameName, setGameName] = useState<string>('')
  const [tagLine, setTagLine] = useState<string>('')
  const [region] = useState<string>('NA1')
  const [player, setPlayer] = useState<Player | null>(null)
  const [reports, setReports] = useState<CoachingReport[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  
  const handleSearch = async () => {
    if (!gameName || !tagLine) return
    try {
      setLoading(true)
      const p = await apiClient.getPlayer(region, gameName, tagLine)
      setPlayer(p)
      const r = await apiClient.getReports(p.puuid)
      setReports(r)
    } catch (err) {
      console.error(err)
      alert("Error fetching player. Ensure backend is running and player exists.")
    } finally {
      setLoading(false)
    }
  }

  const activeReport = reports.length > 0 ? reports[0] : null

  return (
    <div className="min-h-full p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Search Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-[#111424] border border-[#1e2336] p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white mb-2">Korena <span className="text-cyan-400">Coach</span></h1>
              <p className="text-slate-400 font-medium">Automated VOD Review & Heuristics Intelligence</p>
            </div>
            
            <div className="flex bg-[#090b14]/80 backdrop-blur p-2 rounded-full border border-[#1e2336] shadow-inner max-w-md w-full focus-within:ring-2 ring-cyan-500/50 transition-all">
               <input 
                 value={gameName} 
                 onChange={e => setGameName(e.target.value)} 
                 className="flex-1 bg-transparent px-4 py-2 outline-none text-white placeholder:text-slate-500 font-medium w-full" 
                 placeholder="Riot ID (e.g. Faker)" 
               />
               <div className="w-[1px] bg-[#1e2336] mx-2 my-1"></div>
               <input 
                 value={tagLine} 
                 onChange={e => setTagLine(e.target.value)} 
                 className="w-24 bg-transparent px-2 py-2 outline-none text-slate-300 placeholder:text-slate-500 font-medium" 
                 placeholder="#NA1" 
               />
               <button 
                 onClick={handleSearch} 
                 disabled={loading}
                 className="bg-cyan-500 hover:bg-cyan-400 text-[#090b14] p-3 rounded-full transition-colors disabled:opacity-50 ml-2"
               >
                 {loading ? <Loader2 className="h-5 w-5 animate-spin"/> : <Search className="h-5 w-5"/>}
               </button>
            </div>
          </div>
        </div>

        {player && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* Player Banner Strip */}
             <div className="flex items-center gap-4 p-4 rounded-xl bg-[#111424] border border-[#1e2336]">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-2xl font-black text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  {player.game_name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    {player.game_name} <span className="text-sm font-normal text-slate-500">#{player.tag_line}</span>
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#1e2336] text-slate-300">Level 842</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-500/20 text-cyan-400">Grandmaster</span>
                  </div>
                </div>
             </div>

             <div className="grid gap-6 md:grid-cols-3">
               <StatCard 
                 title="Critical Moments" 
                 value={String(activeReport?.critical_moments?.deaths_in_lane_phase ?? 0)} 
                 themeColor="rose" 
                 icon={Activity}
               >
                 <div className="flex items-center gap-2">
                   <span className="px-2 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-400">High Priority</span>
                   <p className="text-xs font-medium text-slate-500">Deaths evaluated in laning phase</p>
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
                 value={activeReport?.training_plan?.focus ? String(activeReport.training_plan.focus) : "Aggregate more matches"} 
                 themeColor="amber" 
                 icon={Trophy}
               >
                 <div className="flex items-center gap-2">
                   <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-black text-amber-500 ring-1 ring-amber-500/50">1</span>
                   <p className="text-xs font-medium text-slate-400">Primary focus recommendation</p>
                 </div>
               </StatCard>
             </div>
             
             {/* Timeline Demo Chart */}
             <Card className="border-[#1e2336] bg-[#111424]">
               <CardHeader>
                 <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                   Match Timeline MVP
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="w-full h-32 flex items-end gap-1 px-4 pb-4">
                   {Array.from({length: 40}).map((_, i) => (
                     <div 
                       key={i} 
                       className="flex-1 rounded-t-sm" 
                       style={{
                         height: `${Math.max(10, Math.random() * 100)}%`,
                         backgroundColor: i % 7 === 0 ? '#f43f5e' : (i % 5 === 0 ? '#10b981' : '#1e2336')
                       }}
                     />
                   ))}
                 </div>
                 <div className="flex justify-between text-xs text-slate-500 font-bold px-4 pt-2 border-t border-[#1e2336]">
                   <span>00:00</span>
                   <span>10:00</span>
                   <span>20:00</span>
                   <span>30:00</span>
                   <span>40:00</span>
                 </div>
               </CardContent>
             </Card>
          </div>
        )}
      </div>
    </div>
  )
}
