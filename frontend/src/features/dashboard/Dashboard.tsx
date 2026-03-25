import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { apiClient, CoachingReport, Player } from '../../api/client'
import { Activity, Trophy, Crosshair, Search, Loader2 } from 'lucide-react'

export function Dashboard() {
  const [gameName, setGameName] = useState('')
  const [tagLine, setTagLine] = useState('')
  const [region, setRegion] = useState('NA1')
  const [player, setPlayer] = useState<Player | null>(null)
  const [reports, setReports] = useState<CoachingReport[]>([])
  const [loading, setLoading] = useState(false)
  
  const handleSearch = async () => {
    if (!gameName || !tagLine) return;
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

  // Fallback defaults for MVP demonstrations natively if Report array is missing
  const activeReport = reports.length > 0 ? reports[0] : null;

  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950 font-sans">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-center justify-between pb-4 border-b">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Support Coach MVP</h1>
            <p className="text-slate-500 mt-1">Automated VOD Review & Heuristics Intelligence</p>
          </div>
        </header>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                value={gameName} 
                onChange={e => setGameName(e.target.value)} 
                className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2" 
                placeholder="Riot ID (e.g. Faker)" 
              />
              <input 
                value={tagLine} 
                onChange={e => setTagLine(e.target.value)} 
                className="flex h-11 w-full sm:w-32 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2" 
                placeholder="Tag (e.g. NA1)" 
              />
              <button 
                onClick={handleSearch} 
                disabled={loading}
                className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-8 py-2 text-sm font-medium text-slate-50 transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4"/>}
                Search
              </button>
            </div>
          </CardContent>
        </Card>

        {player && (
          <div className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Card className="shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-slate-500">Critical Moments</CardTitle>
                 <Activity className="h-4 w-4 text-rose-500" />
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                    {activeReport?.critical_moments?.deaths_in_lane_phase ?? 0}
                 </div>
                 <p className="text-xs text-slate-500 mt-1">Deaths evaluated in laning phase</p>
               </CardContent>
             </Card>

             <Card className="shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-slate-500">Core Habits</CardTitle>
                 <Crosshair className="h-4 w-4 text-emerald-500" />
               </CardHeader>
               <CardContent>
                 <div className="text-xl font-bold capitalize text-slate-900">
                    {activeReport?.habits?.ward_placement_efficiency ?? "Insufficient Data"}
                 </div>
                 <p className="text-xs text-slate-500 mt-1">Vision control efficiency bracket</p>
               </CardContent>
             </Card>

             <Card className="shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-slate-500">Training Plan</CardTitle>
                 <Trophy className="h-4 w-4 text-amber-500" />
               </CardHeader>
               <CardContent>
                 <div className="text-sm font-bold capitalize leading-tight text-slate-900">
                    {activeReport?.training_plan?.focus ?? "Aggregate more matches."}
                 </div>
                 <p className="text-xs text-slate-500 mt-1">Recommended primary focus</p>
               </CardContent>
             </Card>
          </div>
        )}
      </div>
    </div>
  )
}
